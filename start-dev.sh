#!/bin/bash
# BlocklyCraft Development Startup Script
# This script starts all required services for development

echo "🚀 Starting BlocklyCraft Development Environment..."

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store PIDs for cleanup
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

# Set up trap for Ctrl+C
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

# Wait a moment for API to initialize
sleep 2

# Check if Vite dev server is already running
if lsof -Pi :1420 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Vite dev server already running on port 1420${NC}"
else
    echo -e "${BLUE}Starting Vite dev server (port 1420)...${NC}"
    npm run dev &
    PIDS+=($!)
    echo -e "${GREEN}✓ Vite dev server started (PID: $!)${NC}"
fi

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎮 BlocklyCraft Development Environment Ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Web UI:${NC}      http://localhost:1420"
echo -e "${BLUE}Python API:${NC}  http://localhost:8585"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for user to press Ctrl+C
wait
