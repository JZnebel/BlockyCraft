#!/bin/bash

echo "========================================"
echo "  BlocklyCraft Loader Auto-Installer"
echo "========================================"
echo ""
echo "Downloading BlocklyCraft Loader..."

LOADER_URL="http://10.248.110.111:8888/blockcraft-loader-1.0.0.jar"
MODS_DIR="$HOME/Library/Application Support/minecraft/mods"

# Create mods directory if it doesn't exist
mkdir -p "$MODS_DIR"

# Download using curl
curl -o "$MODS_DIR/blockcraft-loader-1.0.0.jar" "$LOADER_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  SUCCESS! BlocklyCraft Loader installed!"
    echo "========================================"
    echo ""
    echo "Location: $MODS_DIR/blockcraft-loader-1.0.0.jar"
    echo ""
    echo "Start Minecraft to auto-download mods!"
    echo ""
else
    echo ""
    echo "ERROR: Failed to download. Make sure you're connected to the server."
    echo ""
fi

echo ""
read -p "Press Enter to exit..."
