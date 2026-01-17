#!/bin/bash

# Kill background processes on exit
trap "kill 0" EXIT

echo "🚀 Starting Smart Traffic Assistant..."

# Start Backend
echo "Starting FastAPI Backend on port 8000..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# Start Frontend
echo "Starting Frontend Server on port 5500..."
cd frontend
python3 -m http.server 5500 &

echo "✅ System is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5500/index.html"
echo "Press Ctrl+C to stop both servers."

# Wait for background processes
wait
