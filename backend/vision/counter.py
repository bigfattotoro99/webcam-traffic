import numpy as np

class LineCounter:
    def __init__(self, line_coords=(0, 300, 640, 300)):
        # x1, y1, x2, y2
        self.line = line_coords
        self.vehicle_count = 0
        self.person_count = 0
        self.counted_ids = set()

    def set_line(self, x1, y1, x2, y2):
        self.line = (x1, y1, x2, y2)

    def reset(self):
        self.vehicle_count = 0
        self.person_count = 0
        self.counted_ids.clear()

    def update(self, tracks):
        """
        tracks: list of dicts with 'id', 'bbox', 'class'
        """
        for track in tracks:
            track_id = track['id']
            if track_id in self.counted_ids:
                continue

            bbox = track['bbox']
            # Centroid
            cx = (bbox[0] + bbox[2]) / 2
            cy = (bbox[1] + bbox[3]) / 2

            # Simple crossing logic (e.g., crossing a horizontal line @ y_pos)
            # For a general line, we'd use cross product/orientation
            x1, y1, x2, y2 = self.line
            
            # Check if centroid is "below" or "above" line
            # This is a simplified version: assuming horizontal-ish line
            # You can improve this with previous position tracking
            if cy > y1: # Cross threshold
                if track['class'] == 'vehicle':
                    self.vehicle_count += 1
                else:
                    self.person_count += 1
                self.counted_ids.add(track_id)

    def get_counts(self):
        return {
            "vehicle": self.vehicle_count,
            "person": self.person_count
        }
