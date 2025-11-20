/**
 * DocsPanel - Slide-out API documentation panel
 */

import React from 'react';

interface DocsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsPanel({ isOpen, onClose }: DocsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className="ml-auto w-full max-w-2xl bg-white shadow-2xl flex flex-col relative z-10 animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              📚 API Reference
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none p-1"
              title="Close"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-white/80">
            Quick reference for shape functions and Python API
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 text-sm">
            {/* COMPONENTS SECTION */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900 mb-2 text-base">📦 Components (Organize Your Model!)</p>
              <code className="block bg-white p-3 rounded mt-2 overflow-x-auto font-mono text-xs border border-gray-200">
                {`tower_blocks = create_cylinder(...)
blocks.extend(tower_blocks)  # IMPORTANT!
components.append({
  "id": "tower",
  "type": "cylinder",
  "blocks": tower_blocks,
  "description": "Main tower"
})`}
              </code>
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 font-semibold text-xs">⚠️ Don't forget blocks.extend()!</p>
              </div>
              <p className="text-gray-700 mt-2 text-xs">
                Components can be moved, rotated, and deleted in the 3D viewer
              </p>
            </div>

            {/* SHAPE FUNCTIONS */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="font-bold text-green-900 mb-3 text-base">🎨 Shape Library Functions</p>
              <div className="space-y-1.5">
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_sphere(radius, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_cylinder(height, radius, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_box(width, height, depth, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_cone(height, base_radius, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_pyramid(base_width, height, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_torus(major_r, minor_r, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_plane(width, depth, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_hemisphere(radius, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_ellipsoid(rx, ry, rz, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_wedge(w, h, d, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_arch(w, h, d, thickness, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_star(points, inner_r, outer_r, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_ring(outer_r, inner_r, height, scale, block_id)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">create_text("HELLO", scale, block_id)</code>
              </div>
            </div>

            {/* ROTATION FUNCTIONS */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="font-bold text-yellow-900 mb-2 text-base">🔄 Rotation Functions</p>
              <div className="space-y-1.5">
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">rotate_blocks_x(blocks, 90)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">rotate_blocks_y(blocks, -90)</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">rotate_blocks_z(blocks, 180)</code>
              </div>
              <p className="text-gray-700 mt-2 text-xs">Angles: 90, -90, 180, -180 degrees only</p>
            </div>

            {/* MANUAL BLOCKS */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="font-bold text-orange-900 mb-2 text-base">🧱 Manual Block Creation</p>
              <code className="block bg-white p-3 rounded overflow-x-auto font-mono text-xs border border-gray-200">
                {`blocks.append({
  "block": "stone",
  "x": 0, "y": 0, "z": 0,
  "scale": [0.25, 0.25, 0.25],
  "brightness": {"sky": 15, "block": 0}
})`}
              </code>
            </div>

            {/* PYTHON BASICS */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-bold text-blue-900 mb-2 text-base">🐍 Python Basics</p>
              <div className="space-y-1.5">
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">for x in range(10):</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">import math</code>
                <code className="block bg-white px-2 py-1 rounded text-xs border border-gray-200">import random</code>
              </div>
              <p className="text-gray-700 mt-2 text-xs">
                Coordinates: X (left/right), Y (up/down), Z (forward/back)
              </p>
            </div>

            {/* COMMON BLOCKS */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-bold text-gray-900 mb-2 text-base">🎨 Common Block Types:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <code className="bg-white px-2 py-1 rounded border border-gray-200">stone</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">oak_planks</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">stone_bricks</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">glass</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">gold_block</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">diamond_block</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">red_concrete</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">blue_wool</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">oak_log</code>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">cobblestone</code>
              </div>
              <p className="text-gray-600 mt-2 text-xs">Use block ID as-is (no prefix needed)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 text-center">
          <a href="/docs" target="_blank" className="text-purple-600 hover:text-purple-700 font-semibold">
            📖 View Full Documentation →
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
