# Baby Care Monitoring System — Backend

Django + Django REST Framework + Django Channels backend for a real-time
baby monitoring mobile application.

## Tech Stack
- Python 3.11, Django 5.0.6
- Django REST Framework + SimpleJWT (authentication)
- Django Channels + Daphne (WebSocket support, ASGI)
- OpenCV (motion detection via frame differencing)
- NumPy (audio amplitude analysis for cry detection)
- SQLite (development database)
- Local disk storage for media (S3-ready via django-storages, currently disabled)

## Architecture
Mobile App (Monitor) Mobile App (Viewer)

Captures camera frames (1.5s interval) - Displays live feed
Records audio bursts (2s chunks) - Shows real-time alerts
| ^
v |
WebSocket: ws://<host>/ws/monitor/<baby_id>/ ---------+
|
v
MonitorConsumer (Django Channels)
Relays video frames to all viewers in the room
Runs motion detection (OpenCV frame diff)
Runs cry detection (PCM16 amplitude threshold)
Saves Event + SystemLog records on detection
Broadcasts alerts to all clients in the room
## Apps
- **accounts** — custom User model, JWT auth, profile CRUD
- **babies** — Baby profile CRUD (per-user, full ownership scoping)
- **monitoring** — Event history, SystemLog, WebSocket consumer, detection logic

## API Endpoints

### Auth (`/api/auth/`)
- `POST /register/` — create account, returns JWT tokens
- `POST /login/` — returns JWT access + refresh tokens
- `POST /login/refresh/` — refresh access token
- `GET/PATCH/DELETE /profile/` — view, update, or delete own account
- `POST /profile/change-password/` — change password

### Babies (`/api/babies/`)
- Full CRUD (`GET`, `POST`, `PATCH`, `DELETE`) — scoped to authenticated user only

### Events (`/api/events/`)
- `GET /` — list motion/cry events, filterable by `?baby=<id>&type=<motion|cry>`
- `GET /logs/` — SystemLog entries (operational logs: connect/disconnect/detection lifecycle)

### WebSocket (`/ws/monitor/<baby_id>/`)
Binary protocol:
- `0x01` + JPEG bytes → video frame (Monitor → server → relayed to Viewers)
- `0x02` + PCM16 bytes → audio chunk (Monitor → server, analyzed for cry detection)

Text protocol:
- `{"role": "monitor"}` / `{"role": "viewer"}` — sent once on connect

## Detection Logic

**Motion detection** (`monitoring/detection/motion_detector.py`):
Grayscale frame differencing against the previous frame. If more than 2% of
pixels change beyond a brightness threshold, motion is flagged.

**Cry detection** (`monitoring/detection/cry_detector.py`):
RMS amplitude of PCM16 audio chunks compared against a fixed threshold.

Both use a 5-second cooldown per baby to avoid duplicate events from
continuous detection.

## Testing

Two standalone WebSocket test clients (no phone required) are included:
- `test_monitor_client.py` — simulates a Monitor phone; sends test frames
  and audio, verifies detection fires correctly
- `test_viewer_client.py` — simulates a Viewer phone; connects to the same
  room and confirms it receives relayed frames + alerts in real time

Run with the Django server active:
```bash
python test_monitor_client.py
python test_viewer_client.py <baby_id>
```

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```