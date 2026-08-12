import json
import time
from io import BytesIO

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

    Binary message protocol (from Monitor phone):
      - First byte 0x01 -> rest of payload is a JPEG video frame
      - First byte 0x02 -> rest of payload is a raw PCM16 audio chunk

    Text message protocol (JSON control messages), e.g.:
      { "role": "monitor" }  or  { "role": "viewer" }
    """

    EVENT_COOLDOWN_SECONDS = 5  # avoid spamming duplicate events

    async def connect(self):
        self.baby_id = self.scope['url_route']['kwargs']['baby_id']
        self.room_group_name = f'baby_{self.baby_id}'
        self.role = 'viewer'  # default until told otherwise

        self.motion_detector = MotionDetector()
        self.cry_detector = CryDetector()

        self.last_motion_event_time = 0
        self.last_cry_event_time = 0

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

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
            self.role = data['role']  # 'monitor' or 'viewer'

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
        # 1. Relay the live frame to everyone in the room (so Viewer sees it)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'video_frame_message',
                'sender_channel': self.channel_name,
                'frame': jpeg_bytes,
            }
        )

        # 2. Run motion detection
        is_motion = self.motion_detector.detect(jpeg_bytes)
        if is_motion:
            now = time.time()
            if now - self.last_motion_event_time > self.EVENT_COOLDOWN_SECONDS:
                self.last_motion_event_time = now
                await self._create_event_and_broadcast('motion', jpeg_bytes)

    async def _handle_audio_chunk(self, pcm_bytes: bytes):
        is_cry = self.cry_detector.detect(pcm_bytes)
        if is_cry:
            now = time.time()
            if now - self.last_cry_event_time > self.EVENT_COOLDOWN_SECONDS:
                self.last_cry_event_time = now
                # No frame tied directly to audio chunk, so save without snapshot
                await self._create_event_and_broadcast('cry', None)

    async def _create_event_and_broadcast(self, event_type: str, jpeg_bytes):
        event_data = await self._save_event(event_type, jpeg_bytes)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'alert_message',
                'data': event_data,
            }
        )

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

    # ---- Group message handlers (called via channel_layer.group_send) ----

    async def video_frame_message(self, event):
        # Don't echo the frame back to the sender (Monitor phone) — only forward to others (Viewer)
        if event['sender_channel'] == self.channel_name:
            return
        await self.send(bytes_data=event['frame'])

    async def alert_message(self, event):
        await self.send(text_data=json.dumps({
            'alert': True,
            **event['data'],
        }))