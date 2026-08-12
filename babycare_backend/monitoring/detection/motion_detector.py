import cv2
import numpy as np


class MotionDetector:
    def __init__(self, diff_threshold=25, motion_pixel_ratio=0.02):
        self.prev_frame = None
        self.diff_threshold = diff_threshold
        self.motion_pixel_ratio = motion_pixel_ratio

    def detect(self, jpeg_bytes: bytes) -> bool:
        np_arr = np.frombuffer(jpeg_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return False

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        if self.prev_frame is None:
            self.prev_frame = gray
            return False

        frame_delta = cv2.absdiff(self.prev_frame, gray)
        thresh = cv2.threshold(frame_delta, self.diff_threshold, 255, cv2.THRESH_BINARY)[1]

        changed_pixels = cv2.countNonZero(thresh)
        total_pixels = thresh.shape[0] * thresh.shape[1]
        ratio = changed_pixels / total_pixels

        self.prev_frame = gray
        return ratio > self.motion_pixel_ratio