#!/bin/bash
# BlocklyCraft Tauri Development Startup Script
# This script starts the Python API and Tauri dev environment

echo "🚀 Starting BlocklyCraft Tauri Development..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Store PIDs
PIDS=()

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    for pid in "${PIDS[@]}"; do
        kill $pid 2>/dev/null
    done
    echo -e "${GREEN}All services stopped. Goodbye!${NC}"
    exit 0
}

trap cleanup INT TERM

# Check if Python API is already running
if lsof -Pi :8585 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Python API already running on port 8585${NC}"
else
    echo -e "${BLUE}Starting Python API server (port 8585)...${NC}"
    python3 deploy_java_api.py &
    PIDS+=($!)
    echo -e "${GREEN}✓ Python API started (PID: $!)${NC}"
fi

# Wait for API to initialize
sleep 2

# Start Tauri dev
echo -e "${BLUE}Starting Tauri development mode...${NC}"
npm run tauri dev

# Cleanup on exit
cleanup
