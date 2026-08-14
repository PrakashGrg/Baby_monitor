import numpy as np


class CryDetector:
    def __init__(self, amplitude_threshold=8000):
        self.amplitude_threshold = amplitude_threshold

    def detect(self, pcm_bytes: bytes) -> bool:
        if len(pcm_bytes) < 2:
            return False

        # Ensure buffer length is a multiple of 2 (required for int16 samples).
        # Audio bursts from the phone may have an odd trailing byte after
        # WAV header stripping — trim it off rather than crashing.
        usable_length = len(pcm_bytes) - (len(pcm_bytes) % 2)
        if usable_length < 2:
            return False

        audio_data = np.frombuffer(pcm_bytes[:usable_length], dtype=np.int16)
        if audio_data.size == 0:
            return False

        rms = np.sqrt(np.mean(audio_data.astype(np.float64) ** 2))
        return rms > self.amplitude_threshold