∆∆#!/bin/bash
# Smart Health — Start all services
echo "════════════════════════════════════════"
echo "  SmartHealth AI — Starting Services"
echo "════════════════════════════════════════"

# Kill anything on our ports
lsof -ti :5001 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :8000 | xargs kill -9 2>/dev/null
sleep 1

# Start ML Service
echo "▶  Starting ML Service (port 8000)..."
cd "$(dirname "$0")/ml-service" && python3.12 app.py > /tmp/ml-service.log 2>&1 &
ML_PID=$!
sleep 3
echo "✅ ML Service PID: $ML_PID"

# Start Backend
echo "▶  Starting Backend (port 5001)..."
cd "$(dirname "$0")/backend" && npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2
echo "✅ Backend PID: $BACKEND_PID"

# Start Frontend
echo "▶  Starting Frontend (port 3000)..."
cd "$(dirname "$0")/frontend" && npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

echo ""
echo "════════════════════════════════════════"
echo "  All services started!"
echo "  Frontend  → http://localhost:3000"
echo "  Backend   → http://localhost:5001"
echo "  ML API    → http://localhost:8000"
echo "════════════════════════════════════════"
echo ""
echo "Logs: /tmp/ml-service.log | /tmp/backend.log | /tmp/frontend.log"
echo "Press Ctrl+C to stop all services"

wait $ML_PID $BACKEND_PID $FRONTEND_PID
