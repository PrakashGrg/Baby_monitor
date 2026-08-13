"""
Standalone test script that simulates a Viewer client.
Connects to the same WebSocket room as an active Monitor phone,
sends {"role": "viewer"}, and listens for:
  1. Relayed binary video frames (proves Monitor -> Viewer relay works)
  2. JSON alert messages (motion/cry detection broadcasts)

Usage:
  1. Start your Monitor phone streaming a baby (note the baby_id)
  2. Run this script with that baby_id while Monitor is still active
  3. Watch for "Received frame" and "ALERT RECEIVED" messages

Run with: python test_viewer_client.py <baby_id>
Example:  python test_viewer_client.py 2
"""

import asyncio
import json
import sys
import websockets

BABY_ID = sys.argv[1] if len(sys.argv) > 1 else "2"
WS_URL = f"ws://127.0.0.1:8000/ws/monitor/{BABY_ID}/"


async def main():
    print(f"Connecting as VIEWER to {WS_URL} ...")
    async with websockets.connect(WS_URL, max_size=10 * 1024 * 1024) as ws:
        print("Connected. Sending role=viewer ...")
        await ws.send(json.dumps({"role": "viewer"}))

        print("Waiting for live frames and alerts from the Monitor...")
        print("(Make sure your phone is actively in Monitor mode for the same baby_id)\n")

        frame_count = 0
        try:
            async for message in ws:
                if isinstance(message, bytes):
                    frame_count += 1
                    print(f"🎥 Received frame #{frame_count}, {len(message)} bytes")
                else:
                    try:
                        data = json.loads(message)
                        if data.get("alert"):
                            print(f"\n🔔 ALERT RECEIVED: {data}\n")
                    except json.JSONDecodeError:
                        print(f"Text message: {message}")
        except websockets.exceptions.ConnectionClosed:
            print(f"\nConnection closed. Total frames received: {frame_count}")


if __name__ == "__main__":
    asyncio.run(main())