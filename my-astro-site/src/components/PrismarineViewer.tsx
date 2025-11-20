/**
 * Minecraft Texture Viewer
 * Renders blocks with real Minecraft textures from Faithful pack
 */

import React, { useEffect, useRef, useState } from 'react';

interface MinecraftViewerProps {
  blocks: Array<{ x: number; y: number; z: number; blockName: string }>;
  onClose: () => void;
}

export default function MinecraftViewer({ blocks, onClose }: MinecraftViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    const initViewer = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import the viewer class
        const { MinecraftTextureViewer } = await import('../utils/minecraft-texture-viewer');

        // Create viewer
        const viewer = new MinecraftTextureViewer('minecraft-texture-container');
        viewerRef.current = viewer;

        // Load blocks (async with batching for large models)
        await viewer.loadBlocks(blocks);

        setLoading(false);
      } catch (err) {
        console.error('[MinecraftViewer] Init error:', err);
        setLoading(false);
      }
    };

    // Calculate stats
    const uniqueBlocks = new Set(blocks.map(b => b.blockName)).size;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    blocks.forEach(block => {
      minX = Math.min(minX, block.x);
      maxX = Math.max(maxX, block.x);
      minY = Math.min(minY, block.y);
      maxY = Math.max(maxY, block.y);
      minZ = Math.min(minZ, block.z);
      maxZ = Math.max(maxZ, block.z);
    });

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const depth = maxZ - minZ + 1;

    setInfo(`${blocks.length} blocks • ${uniqueBlocks} types • ${width}×${height}×${depth}`);

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [blocks]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-display font-bold text-gray-800">
              🎮 Minecraft Preview
            </h2>
            <p className="text-sm text-gray-600">{info}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
          >
            Close
          </button>
        </div>

        {/* Viewer */}
        <div className="flex-1 relative bg-gradient-to-b from-sky-400 to-sky-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Loading Minecraft textures...</p>
              </div>
            </div>
          )}

          <div
            id="minecraft-texture-container"
            ref={containerRef}
            className="w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            ✨ Rendered with real Minecraft textures from Faithful resource pack
          </p>
        </div>
      </div>
    </div>
  );
}
