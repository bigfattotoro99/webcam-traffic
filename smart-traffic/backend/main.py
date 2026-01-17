# backend/main.py

import time
from collections import deque
from dataclasses import dataclass
from typing import Dict, Tuple, List

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket
from ultralytics import YOLO

import sys
import os
# Add current directory to path so it can find backend.roads
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.roads import ROADS

app = FastAPI()

# YOLO COCO ids
PERSON = 0
VEHICLE_IDS = {2, 3, 5, 7}  # car, motorcycle, bus, truck

# Model: yolov8n.pt is lightweight
model = YOLO("yolov8n.pt")

# Sending frequency
SEND_EVERY_SEC = 0.25

# Smoothing window
WINDOW_SEC = 2.0

# Thresholds
RED_TH = 25
YELLOW_TH = 10

def level_by_vehicles(v: float) -> str:
    if v >= RED_TH:
        return "HIGH"
    if v >= YELLOW_TH:
        return "MED"
    return "LOW"

def in_roi_xyxy(box: np.ndarray, roi: Tuple[int, int, int, int]) -> bool:
    x1, y1, x2, y2 = box
    rx1, ry1, rx2, ry2 = roi
    cx = (x1 + x2) / 2.0
    cy = (y1 + y2) / 2.0
    return (rx1 <= cx <= rx2) and (ry1 <= cy <= ry2)

@dataclass
class RoadState:
    road_id: str
    name: str
    roi: Tuple[int, int, int, int]
    cap: cv2.VideoCapture
    history: deque  # stores (ts, vehicles_now, people_now)

def open_capture(src: str) -> cv2.VideoCapture:
    # Handle both video files and camera indices
    if isinstance(src, str) and src.isdigit():
        src = int(src)
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        print(f"Warning: Cannot open video source {src}. Simulation will use zeros.")
    return cap

def smooth_counts(history: deque, now: float, v_now: int, p_now: int) -> Tuple[float, float]:
    history.append((now, v_now, p_now))
    while history and (now - history[0][0]) > WINDOW_SEC:
        history.popleft()
    vs = [x[1] for x in history]
    ps = [x[2] for x in history]
    v_avg = float(sum(vs)) / max(len(vs), 1)
    p_avg = float(sum(ps)) / max(len(ps), 1)
    return v_avg, p_avg

def read_and_count(state: RoadState) -> Tuple[int, int]:
    if not state.cap.isOpened():
        return 0, 0
        
    ok, frame = state.cap.read()
    if not ok:
        # Loop if video file
        state.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ok, frame = state.cap.read()
        if not ok:
            return 0, 0

    results = model.predict(frame, imgsz=640, conf=0.40, verbose=False)[0]

    v_count = 0
    p_count = 0

    if results.boxes is None or len(results.boxes) == 0:
        return 0, 0

    boxes = results.boxes.xyxy.cpu().numpy()
    cls = results.boxes.cls.cpu().numpy().astype(int)

    for box, c in zip(boxes, cls):
        if not in_roi_xyxy(box, state.roi):
            continue
        if c == PERSON:
            p_count += 1
        elif c in VEHICLE_IDS:
            v_count += 1

    return v_count, p_count

def build_states() -> List[RoadState]:
    states: List[RoadState] = []
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for r in ROADS:
        video_path = os.path.join(base_path, r["video"])
        cap = open_capture(video_path)
        roi = tuple(r["roi"])
        states.append(
            RoadState(
                road_id=r["id"],
                name=r["name"],
                roi=roi,
                cap=cap,
                history=deque(),
            )
        )
    return states

@app.websocket("/ws")
async def ws(ws: WebSocket):
    await ws.accept()

    try:
        states = build_states()
    except Exception as e:
        await ws.send_json({"error": str(e)})
        await ws.close()
        return

    last_send = 0.0

    try:
        while True:
            now = time.time()
            payload_roads: Dict[str, dict] = {}

            for st in states:
                v_now, p_now = read_and_count(st)
                v_s, p_s = smooth_counts(st.history, now, v_now, p_now)
                lvl = level_by_vehicles(v_s)

                payload_roads[st.road_id] = {
                    "name": st.name,
                    "counts_now": {"vehicles": int(v_now), "people": int(p_now)},
                    "counts_smooth": {"vehicles": round(v_s, 1), "people": round(p_s, 1)},
                    "level": lvl
                }

            if now - last_send >= SEND_EVERY_SEC:
                await ws.send_json({
                    "ts": now,
                    "roads": payload_roads,
                    "thresholds": {"red": RED_TH, "yellow": YELLOW_TH},
                    "window_sec": WINDOW_SEC
                })
                last_send = now
            
            # Small sleep to prevent 100% CPU in the loop if processing is too fast
            time.sleep(0.01)

    except Exception as e:
        try:
            await ws.send_json({"error": str(e)})
        except:
            pass
    finally:
        for st in states:
            try:
                st.cap.release()
            except Exception:
                pass
        try:
            await ws.close()
        except:
            pass
