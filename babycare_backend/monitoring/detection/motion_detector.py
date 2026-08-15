import cv2
import numpy as np


class MotionDetector:
    def __init__(self, diff_threshold=35, motion_pixel_ratio=0.08, min_contour_area=500):
        self.prev_frame = None
        self.diff_threshold = diff_threshold
        self.motion_pixel_ratio = motion_pixel_ratio
        self.min_contour_area = min_contour_area

    def detect(self, jpeg_bytes: bytes):
        """
        Returns a tuple: (is_motion: bool, annotated_jpeg_bytes: bytes or None)
        annotated_jpeg_bytes is the original frame with a bounding box drawn,
        only returned when motion is detected.
        """
        np_arr = np.frombuffer(jpeg_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return False, None

        frame = cv2.resize(frame, (320, 240))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        if self.prev_frame is None:
            self.prev_frame = gray
            return False, None

        if self.prev_frame.shape != gray.shape:
            self.prev_frame = gray
            return False, None

        frame_delta = cv2.absdiff(self.prev_frame, gray)
        thresh = cv2.threshold(frame_delta, self.diff_threshold, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)

        changed_pixels = cv2.countNonZero(thresh)
        total_pixels = thresh.shape[0] * thresh.shape[1]
        ratio = changed_pixels / total_pixels

        self.prev_frame = gray

        is_motion = ratio > self.motion_pixel_ratio
        if not is_motion:
            return False, None

        # Find contours in the thresholded motion mask
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Draw a green box around each significant contour
        annotated = frame.copy()
        found_box = False
        for contour in contours:
            if cv2.contourArea(contour) < self.min_contour_area:
                continue
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)
            found_box = True

        # Status label overlay
        label = "Motion Detected" if found_box else "Motion Detected (minor)"
        cv2.putText(
            annotated, label, (10, 20),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2
        )

        success, encoded = cv2.imencode('.jpg', annotated)
        annotated_bytes = encoded.tobytes() if success else None

        return True, annotated_bytes