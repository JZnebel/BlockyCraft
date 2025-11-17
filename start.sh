#!/bin/bash

# BlockCraft Startup Script
# Starts both the web editor and deployment API

echo "🎮 Starting BlockCraft..."
echo ""

# Start the deployment API in the background
echo "🚀 Starting deployment API on port 5000..."
python3 deploy_api.py &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start the web server
echo "🌐 Starting web editor on port 3456..."
echo ""
echo "=" * 60
echo "✅ BlockCraft is ready!"
echo ""
echo "📱 Open your browser: http://localhost:3456"
echo "🔧 Deployment API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=" * 60
echo ""

python3 serve.py

# When serve.py exits (Ctrl+C), kill the API too
kill $API_PID 2>/dev/null
echo ""
echo "👋 BlockCraft stopped!"
