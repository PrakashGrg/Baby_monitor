"""
Standalone test script that simulates a Monitor phone.
Connects directly to the WebSocket, sends:
  1. A baseline video frame (no motion yet)
  2. A second video frame with a visible change (should trigger motion)
  3. A loud fake audio chunk (should trigger cry detection)
Then listens for alert messages coming back from the server.

Run with: python test_monitor_client.py
"""

import asyncio
import json
import numpy as np
import cv2
import websockets

BABY_ID = 2  # "Motu chet"
WS_URL = f"ws://127.0.0.1:8000/ws/monitor/{BABY_ID}/"


def make_frame(with_shape: bool) -> bytes:
    frame = np.zeros((240, 320, 3), dtype=np.uint8)
    if with_shape:
        cv2.rectangle(frame, (80, 60), (240, 180), (255, 255, 255), -1)
    success, jpeg = cv2.imencode('.jpg', frame)
    return jpeg.tobytes()


def make_loud_audio_chunk() -> bytes:
    samples = (np.random.uniform(-1, 1, 4096) * 20000).astype(np.int16)
    return samples.tobytes()


def make_quiet_audio_chunk() -> bytes:
    samples = (np.random.uniform(-1, 1, 4096) * 200).astype(np.int16)
    return samples.tobytes()


async def listen_for_alerts(ws):
    try:
        async for message in ws:
            if isinstance(message, str):
                data = json.loads(message)
                print(f"\nALERT RECEIVED: {data}\n")
    except websockets.exceptions.ConnectionClosed:
        pass


async def main():
    print(f"Connecting to {WS_URL} ...")
    async with websockets.connect(WS_URL, max_size=10 * 1024 * 1024) as ws:
        print("Connected.")

        listener_task = asyncio.create_task(listen_for_alerts(ws))

        await ws.send(json.dumps({"role": "monitor"}))
        await asyncio.sleep(0.5)

        print("Sending baseline frame (no motion expected)...")
        frame1 = make_frame(with_shape=False)
        await ws.send(b'\x01' + frame1)
        await asyncio.sleep(1)

        print("Sending changed frame (motion SHOULD be detected)...")
        frame2 = make_frame(with_shape=True)
        await ws.send(b'\x01' + frame2)
        await asyncio.sleep(1)

        print("Sending quiet audio (cry should NOT trigger)...")
        quiet_audio = make_quiet_audio_chunk()
        await ws.send(b'\x02' + quiet_audio)
        await asyncio.sleep(1)

        print("Sending loud audio (cry SHOULD trigger)...")
        loud_audio = make_loud_audio_chunk()
        await ws.send(b'\x02' + loud_audio)
        await asyncio.sleep(1)

        print("\nDone sending test data. Waiting 3s for any final alerts...")
        await asyncio.sleep(3)

        listener_task.cancel()

    print("\nTest complete. Check the output above for 'ALERT RECEIVED' messages.")
    print("Also check Django admin (http://127.0.0.1:8000/admin/) under Monitoring > Events to confirm events were saved.")


if __name__ == "__main__":
    asyncio.run(main())