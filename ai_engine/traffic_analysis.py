import random
import time
import json

class TrafficAI:
    def __init__(self):
        self.roads = {
            "1": {"name": "Sukhumvit", "density": 50, "light": "red"},
            "2": {"name": "Rama IV", "density": 30, "light": "green"},
        }
    
    def analyze_traffic(self):
        print("Analyzing traffic patterns from sensor data...", flush=True)
        # Simulate neural network processing delay
        time.sleep(1) 
        
        for road_id, data in self.roads.items():
            # Simulate changing density based on random factors (input from cellular networks)
            change = random.randint(-10, 15)
            data["density"] = max(0, min(100, data["density"] + change))
            
            # AI Logic: Adaptive Light Control
            if data["density"] > 70:
                 if data["light"] == "red":
                     print(f"HIGH CONGESTION DETECTED on {data['name']}. Switching to GREEN.", flush=True)
                     data["light"] = "green"
                 else:
                     print(f"Maintaining GREEN on {data['name']} to clear traffic.", flush=True)
            elif data["density"] < 30:
                 if data["light"] == "green":
                     print(f"Low traffic on {data['name']}. Switching to RED to optimize flow elsewhere.", flush=True)
                     data["light"] = "red"
            
            print(f"Road: {data['name']} | Density: {data['density']}% | Light: {data['light'].upper()}", flush=True)

    def run(self):
        print("Starting AI Traffic Control System...", flush=True)
        while True:
            self.analyze_traffic()
            print("-" * 30, flush=True)
            time.sleep(3)

if __name__ == "__main__":
    ai = TrafficAI()
    ai.run()
