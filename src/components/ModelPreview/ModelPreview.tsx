import { useEffect, useRef, useState, memo } from 'react';
import type { BlockDisplayEntity } from '@/utils/database';
import Modal from '@/components/Modal/Modal';
import './ModelPreview.css';

interface ModelPreviewProps {
  blocks: BlockDisplayEntity[];
  size?: number;
  clickable?: boolean;
}

// Simple color mapping for common Minecraft blocks
const BLOCK_COLORS: { [key: string]: string } = {
  // Stone variants
  'minecraft:stone': '#7F7F7F',
  'minecraft:cobblestone': '#7F7F7F',
  'minecraft:smooth_quartz': '#F4EDE4',
  'minecraft:smooth_quartz_slab': '#F4EDE4',
  'minecraft:polished_andesite': '#848C8C',
  'minecraft:polished_andesite_slab': '#848C8C',

  // Sandstone
  'minecraft:sandstone': '#E0D6A6',
  'minecraft:cut_sandstone': '#E0D6A6',
  'minecraft:cut_sandstone_slab': '#E0D6A6',
  'minecraft:smooth_sandstone': '#E0D6A6',

  // Wood
  'minecraft:oak_planks': '#9C7F4E',
  'minecraft:dark_oak_planks': '#4A3320',
  'minecraft:spruce_planks': '#7A5833',
  'minecraft:birch_planks': '#D7CB8D',

  // Fences
  'minecraft:oak_fence': '#9C7F4E',
  'minecraft:dark_oak_fence': '#4A3320',
  'minecraft:spruce_fence': '#7A5833',

  // Lights
  'minecraft:lantern': '#FDB848',
  'minecraft:soul_lantern': '#4ECDC4',
  'minecraft:torch': '#FDB848',
  'minecraft:glowstone': '#F9D371',
  'minecraft:sea_lantern': '#A0DDD9',

  // Concrete
  'minecraft:white_concrete': '#E4E4E4',
  'minecraft:light_gray_concrete': '#9D9D97',
  'minecraft:gray_concrete': '#4C4C4C',
  'minecraft:black_concrete': '#080A0F',
  'minecraft:red_concrete': '#B02E26',
  'minecraft:orange_concrete': '#F9801D',
  'minecraft:yellow_concrete': '#FED83D',
  'minecraft:lime_concrete': '#80C71F',
  'minecraft:green_concrete': '#5E7C16',
  'minecraft:cyan_concrete': '#169C9C',
  'minecraft:light_blue_concrete': '#3AB3DA',
  'minecraft:blue_concrete': '#3C44AA',
  'minecraft:purple_concrete': '#8932B8',
  'minecraft:magenta_concrete': '#C74EBD',
  'minecraft:pink_concrete': '#F38BAA',

  // Terracotta
  'minecraft:terracotta': '#985E43',
  'minecraft:white_terracotta': '#D1B1A1',
  'minecraft:orange_terracotta': '#A15325',
  'minecraft:red_terracotta': '#8E3C2E',

  // Default
  'default': '#8B8B8B',
};

function getBlockColor(blockType: string): string {
  return BLOCK_COLORS[blockType] || BLOCK_COLORS['default'];
}

const ModelPreview = memo(function ModelPreview({ blocks, size = 120, clickable = false, rotation = 45 }: ModelPreviewProps & { rotation?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalRotation, setModalRotation] = useState(45);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate bounds
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

    // Calculate actual extents including block scales
    let actualMaxX = -Infinity, actualMinX = Infinity;
    let actualMaxY = -Infinity, actualMinY = Infinity;
    let actualMaxZ = -Infinity, actualMinZ = Infinity;

    blocks.forEach(block => {
      const scaleX = block.scale?.[0] ?? 1.0;
      const scaleY = block.scale?.[1] ?? 1.0;
      const scaleZ = block.scale?.[2] ?? 1.0;

      actualMinX = Math.min(actualMinX, block.x - scaleX / 2);
      actualMaxX = Math.max(actualMaxX, block.x + scaleX / 2);
      actualMinY = Math.min(actualMinY, block.y);
      actualMaxY = Math.max(actualMaxY, block.y + scaleY);
      actualMinZ = Math.min(actualMinZ, block.z - scaleZ / 2);
      actualMaxZ = Math.max(actualMaxZ, block.z + scaleZ / 2);
    });

    const rangeX = actualMaxX - actualMinX;
    const rangeY = actualMaxY - actualMinY;
    const rangeZ = actualMaxZ - actualMinZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ, 0.5); // Minimum range to prevent extreme zoom

    // Isometric projection constants - zoom in more aggressively
    const scale = Math.min(size / maxRange / 1.5, size / 3);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Convert 3D to 2D isometric with Y rotation
    const rotRad = (rotation * Math.PI) / 180;

    const project = (x: number, y: number, z: number) => {
      // Apply Y-axis rotation
      const rotatedX = x * Math.cos(rotRad) - z * Math.sin(rotRad);
      const rotatedZ = x * Math.sin(rotRad) + z * Math.cos(rotRad);

      // Isometric projection
      const isoX = (rotatedX - rotatedZ) * Math.cos(Math.PI / 6);
      const isoY = (rotatedX + rotatedZ) * Math.sin(Math.PI / 6) - y;
      return {
        x: centerX + isoX * scale,
        y: centerY + isoY * scale
      };
    };

    // Sort blocks by depth for proper rendering
    const sortedBlocks = [...blocks].sort((a, b) => {
      const depthA = a.x + a.y + a.z;
      const depthB = b.x + b.y + b.z;
      return depthA - depthB;
    });

    // Draw each block as an isometric cube
    sortedBlocks.forEach(block => {
      const color = getBlockColor(block.block);
      const { x, y, z } = block;

      // Get scale (default to 1.0 if not specified)
      const scaleX = block.scale?.[0] ?? 1.0;
      const scaleY = block.scale?.[1] ?? 1.0;
      const scaleZ = block.scale?.[2] ?? 1.0;

      // Calculate all 8 vertices of the cube
      const v000 = project(x - scaleX / 2, y, z - scaleZ / 2);          // bottom-back-left
      const v100 = project(x + scaleX / 2, y, z - scaleZ / 2);          // bottom-back-right
      const v010 = project(x - scaleX / 2, y + scaleY, z - scaleZ / 2); // top-back-left
      const v110 = project(x + scaleX / 2, y + scaleY, z - scaleZ / 2); // top-back-right
      const v001 = project(x - scaleX / 2, y, z + scaleZ / 2);          // bottom-front-left
      const v101 = project(x + scaleX / 2, y, z + scaleZ / 2);          // bottom-front-right
      const v011 = project(x - scaleX / 2, y + scaleY, z + scaleZ / 2); // top-front-left
      const v111 = project(x + scaleX / 2, y + scaleY, z + scaleZ / 2); // top-front-right

      // Top face (lightest)
      ctx.fillStyle = lightenColor(color, 20);
      ctx.beginPath();
      ctx.moveTo(v010.x, v010.y);
      ctx.lineTo(v110.x, v110.y);
      ctx.lineTo(v111.x, v111.y);
      ctx.lineTo(v011.x, v011.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left face (medium)
      ctx.fillStyle = darkenColor(color, 10);
      ctx.beginPath();
      ctx.moveTo(v000.x, v000.y);
      ctx.lineTo(v010.x, v010.y);
      ctx.lineTo(v011.x, v011.y);
      ctx.lineTo(v001.x, v001.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right face (darkest)
      ctx.fillStyle = darkenColor(color, 25);
      ctx.beginPath();
      ctx.moveTo(v100.x, v100.y);
      ctx.lineTo(v110.x, v110.y);
      ctx.lineTo(v111.x, v111.y);
      ctx.lineTo(v101.x, v101.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

  }, [blocks, size, rotation]);

  const handleClick = () => {
    if (clickable) {
      setShowModal(true);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`model-preview-canvas ${clickable ? 'clickable' : ''}`}
        onClick={handleClick}
        title={clickable ? 'Click to view larger' : ''}
      />

      {clickable && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Model Preview"
          actions={
            <>
              <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto', alignItems: 'center' }}>
                <button
                  className="modal-btn modal-btn-secondary"
                  onClick={() => setModalRotation(r => r - 15)}
                  title="Rotate left"
                >
                  ← Rotate
                </button>
                <span style={{ fontSize: '0.875rem', color: '#606A78' }}>{modalRotation}°</span>
                <button
                  className="modal-btn modal-btn-secondary"
                  onClick={() => setModalRotation(r => r + 15)}
                  title="Rotate right"
                >
                  Rotate →
                </button>
              </div>
              <button className="modal-btn modal-btn-primary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <ModelPreview blocks={blocks} size={400} clickable={false} rotation={modalRotation} />
          </div>
        </Modal>
      )}
    </>
  );
});

export default ModelPreview;

// Helper functions to lighten/darken colors
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
