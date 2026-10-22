#!/bin/bash

echo "Starting Rhythmic..."
echo ""

echo "Building backend..."
cd cmd/api
go build -o rhythmic-api main.go
if [ $? -ne 0 ]; then
    echo "Failed to build backend"
    exit 1
fi
cd ../..

echo ""
echo "Starting backend server..."
cd cmd/api
./rhythmic-api &
BACKEND_PID=$!
cd ../..

echo ""
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Servers started!"
echo "Backend: http://localhost:8090"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
