import numpy as np


class CryDetector:
    def __init__(self, amplitude_threshold=3000):
        self.amplitude_threshold = amplitude_threshold

    def detect(self, pcm_bytes: bytes) -> bool:
        if len(pcm_bytes) < 2:
            return False

        audio_data = np.frombuffer(pcm_bytes, dtype=np.int16)
        if audio_data.size == 0:
            return False

        rms = np.sqrt(np.mean(audio_data.astype(np.float64) ** 2))
        return rms > self.amplitude_threshold