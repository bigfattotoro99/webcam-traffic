import cv2
import threading
import time
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from backend.vision.detector import TrafficDetector
from backend.vision.counter import LineCounter
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Camera:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.frame = None
        self.detector = TrafficDetector()
        self.counter = LineCounter()
        self.lock = threading.Lock()
        self.fps = 0

    def start(self):
        if not self.is_running:
            self.cap = cv2.VideoCapture(0) # 0 for default webcam
            self.is_running = True
            threading.Thread(target=self._capture_loop, daemon=True).start()

    def stop(self):
        self.is_running = False
        if self.cap:
            self.cap.release()

    def _capture_loop(self):
        prev_time = time.time()
        while self.is_running:
            success, raw_frame = self.cap.read()
            if not success:
                continue

            # Process Frame
            detections = self.detector.detect(raw_frame)
            
            # In a real app, we'd use ByteTrack here. 
            # For simplicity, we'll map detections to dummy tracks
            tracks = []
            for i, d in enumerate(detections):
                tracks.append({
                    'id': f"obj_{int(d['bbox'][0])}_{int(d['bbox'][1])}", # Dummy ID based on pos
                    'bbox': d['bbox'],
                    'class': d['class']
                })
            
            self.counter.update(tracks)

            # Draw UI on Frame
            for d in detections:
                b = d['bbox']
                cv2.rectangle(raw_frame, (int(b[0]), int(b[1])), (int(b[2]), int(b[3])), (0, 255, 0), 2)
                cv2.putText(raw_frame, f"{d['class']} {d['confidence']:.2f}", (int(b[0]), int(b[1]-10)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Draw Crossing Line
            l = self.counter.line
            cv2.line(raw_frame, (int(l[0]), int(l[1])), (int(l[2]), int(l[3])), (0, 0, 255), 3)
            
            # Update shared frame
            with self.lock:
                self.frame = raw_frame
            
            # Calc FPS
            curr_time = time.time()
            self.fps = 1 / (curr_time - prev_time)
            prev_time = curr_time

camera = Camera()

@app.get("/")
def read_root():
    return {"status": "Smart Traffic API Running"}

@app.get("/video_feed")
def video_feed():
    def generate():
        while True:
            with camera.lock:
                if camera.frame is None:
                    continue
                ret, buffer = cv2.imencode('.jpg', camera.frame)
                frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.03) # ~30 FPS

    camera.start()
    return Response(generate(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stats")
def get_stats():
    return {
        **camera.counter.get_counts(),
        "fps": round(camera.fps, 1),
        "camera": "running" if camera.is_running else "stopped"
    }

@app.post("/camera/start")
def start_camera():
    camera.start()
    return {"status": "started"}

@app.post("/camera/stop")
def stop_camera():
    camera.stop()
    return {"status": "stopped"}

@app.post("/reset_counts")
def reset_counts():
    camera.counter.reset()
    return {"status": "reset"}

@app.post("/settings/line")
def set_line(line: dict):
    camera.counter.set_line(line['x1'], line['y1'], line['x2'], line['y2'])
    return {"status": "line updated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
