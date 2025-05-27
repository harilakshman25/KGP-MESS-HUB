#!/bin/bash
echo "Starting KGP MessHub..."

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    sudo systemctl start mongod
fi

# Install dependencies if node_modules don't exist
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Start servers in background
echo "Starting backend server..."
cd server && npm run dev &
SERVER_PID=$!

echo "Starting frontend client..."
cd client && npm run dev &
CLIENT_PID=$!

echo "KGP MessHub is starting..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
