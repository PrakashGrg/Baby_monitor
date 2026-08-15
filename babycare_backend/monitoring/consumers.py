import json
import time

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile

from .detection.motion_detector import MotionDetector
from .detection.cry_detector import CryDetector
from .models import Event
from babies.models import Baby


class MonitorConsumer(AsyncWebsocketConsumer):
    """
    Single WebSocket endpoint used by BOTH the Monitor phone (sends video/audio)
    and the Viewer phone (only receives). All clients for a given baby join the
    same 'room' group.
    """

    EVENT_COOLDOWN_SECONDS = 5

    async def connect(self):
        self.baby_id = self.scope['url_route']['kwargs']['baby_id']
        self.room_group_name = f'baby_{self.baby_id}'
        self.role = 'viewer'

        self.motion_detector = MotionDetector()
        self.cry_detector = CryDetector()

        self.last_motion_event_time = 0
        self.last_cry_event_time = 0

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self._log('INFO', 'Client connected')

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self._log('WARNING', f'Client disconnected ({self.role})')

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            await self._handle_text(text_data)
        elif bytes_data:
            await self._handle_binary(bytes_data)

    async def _handle_text(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        if 'role' in data:
            self.role = data['role']
            await self._log('INFO', f'Role set: {self.role}')

    async def _handle_binary(self, bytes_data):
        if len(bytes_data) < 2:
            return

        msg_type = bytes_data[0]
        payload = bytes_data[1:]

        if msg_type == 0x01:
            await self._handle_video_frame(payload)
        elif msg_type == 0x02:
            await self._handle_audio_chunk(payload)

    async def _handle_video_frame(self, jpeg_bytes: bytes):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'video_frame_message',
                'sender_channel': self.channel_name,
                'frame': jpeg_bytes,
            }
        )

        is_motion, annotated_bytes = self.motion_detector.detect(jpeg_bytes)
        if is_motion:
            now = time.time()
            if now - self.last_motion_event_time > self.EVENT_COOLDOWN_SECONDS:
                self.last_motion_event_time = now
                snapshot_bytes = annotated_bytes if annotated_bytes else jpeg_bytes
                await self._create_event_and_broadcast('motion', snapshot_bytes)

    async def _handle_audio_chunk(self, pcm_bytes: bytes):
        is_cry = self.cry_detector.detect(pcm_bytes)
        if is_cry:
            now = time.time()
            if now - self.last_cry_event_time > self.EVENT_COOLDOWN_SECONDS:
                self.last_cry_event_time = now
                await self._create_event_and_broadcast('cry', None)

    async def _create_event_and_broadcast(self, event_type: str, jpeg_bytes):
        event_data = await self._save_event(event_type, jpeg_bytes)
        await self._log('INFO', f'{event_type.capitalize()} detected, event saved')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'alert_message',
                'data': event_data,
            }
        )
        await self._log('INFO', 'Alert broadcast to room')

    @database_sync_to_async
    def _save_event(self, event_type: str, jpeg_bytes):
        baby = Baby.objects.get(id=self.baby_id)
        event = Event(baby=baby, type=event_type)

        if jpeg_bytes:
            filename = f"{event_type}_{int(time.time())}.jpg"
            event.snapshot.save(filename, ContentFile(jpeg_bytes), save=False)

        event.save()

        return {
            'id': event.id,
            'type': event.type,
            'timestamp': event.timestamp.isoformat(),
            'snapshot': event.snapshot.url if event.snapshot else None,
            'baby_id': baby.id,
        }

    @database_sync_to_async
    def _log(self, level: str, message: str):
        from .models import SystemLog
        try:
            SystemLog.objects.create(baby_id=self.baby_id, level=level, message=message)
        except Exception:
            pass

    async def video_frame_message(self, event):
        if event['sender_channel'] == self.channel_name:
            return
        await self.send(bytes_data=event['frame'])

    async def alert_message(self, event):
        await self.send(text_data=json.dumps({
            'alert': True,
            **event['data'],
        }))