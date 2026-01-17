import cv2
from ultralytics import YOLO
import numpy as np

class TrafficDetector:
    def __init__(self, model_path='yolov8n.pt'):
        # Smallest model for speed
        self.model = YOLO(model_path)
        # Class IDs for YOLOv8 (COCO)
        # 0: person, 2: car, 3: motorcycle, 5: bus, 7: truck
        self.target_classes = [0, 2, 3, 5, 7]

    def detect(self, frame):
        # Run inference
        results = self.model(frame, verbose=False, device='cpu')[0]
        
        detections = []
        for box in results.boxes:
            cls = int(box.cls[0])
            if cls in self.target_classes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                
                # Normalize label
                label = 'person' if cls == 0 else 'vehicle'
                
                detections.append({
                    'bbox': [x1, y1, x2, y2],
                    'confidence': conf,
                    'class': label,
                    'class_id': cls
                })
        
        return detections
