#!/bin/bash

echo "========================================"
echo "  BlocklyCraft Loader Auto-Installer"
echo "========================================"
echo ""
echo "Downloading BlocklyCraft Loader..."

LOADER_URL="http://10.248.110.111:8888/blockcraft-loader-1.0.0.jar"
MODS_DIR="$HOME/.minecraft/mods"

# Create mods directory if it doesn't exist
mkdir -p "$MODS_DIR"

# Download using curl or wget
if command -v curl &> /dev/null; then
    curl -o "$MODS_DIR/blockcraft-loader-1.0.0.jar" "$LOADER_URL"
elif command -v wget &> /dev/null; then
    wget -O "$MODS_DIR/blockcraft-loader-1.0.0.jar" "$LOADER_URL"
else
    echo ""
    echo "ERROR: Neither curl nor wget found. Please install one of them."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

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

read -p "Press Enter to exit..."
