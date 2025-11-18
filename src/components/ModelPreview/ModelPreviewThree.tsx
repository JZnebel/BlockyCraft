import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { BlockDisplayEntity } from '@/utils/database';
import Modal from '@/components/Modal/Modal';
import './ModelPreview.css';

interface ModelPreviewProps {
  blocks: BlockDisplayEntity[];
  size?: number;
  clickable?: boolean;
  draggable?: boolean; // Enable drag-to-rotate (only for large modal view)
}

// Simple color mapping for common Minecraft blocks
const BLOCK_COLORS: { [key: string]: number } = {
  // Stone variants
  'minecraft:stone': 0x7F7F7F,
  'minecraft:cobblestone': 0x7F7F7F,
  'minecraft:smooth_quartz': 0xF4EDE4,
  'minecraft:smooth_quartz_slab': 0xF4EDE4,
  'minecraft:polished_andesite': 0x848C8C,
  'minecraft:polished_andesite_slab': 0x848C8C,

  // Sandstone
  'minecraft:sandstone': 0xE0D6A6,
  'minecraft:cut_sandstone': 0xE0D6A6,
  'minecraft:cut_sandstone_slab': 0xE0D6A6,
  'minecraft:smooth_sandstone': 0xE0D6A6,

  // Wood
  'minecraft:oak_planks': 0x9C7F4E,
  'minecraft:dark_oak_planks': 0x4A3320,
  'minecraft:spruce_planks': 0x7A5833,
  'minecraft:birch_planks': 0xD7CB8D,

  // Fences
  'minecraft:oak_fence': 0x9C7F4E,
  'minecraft:dark_oak_fence': 0x4A3320,
  'minecraft:spruce_fence': 0x7A5833,

  // Lights
  'minecraft:lantern': 0xFDB848,
  'minecraft:soul_lantern': 0x4ECDC4,
  'minecraft:torch': 0xFDB848,
  'minecraft:glowstone': 0xF9D371,
  'minecraft:sea_lantern': 0xA0DDD9,

  // Concrete
  'minecraft:white_concrete': 0xE4E4E4,
  'minecraft:light_gray_concrete': 0x9D9D97,
  'minecraft:gray_concrete': 0x4C4C4C,
  'minecraft:black_concrete': 0x080A0F,
  'minecraft:red_concrete': 0xB02E26,
  'minecraft:orange_concrete': 0xF9801D,
  'minecraft:yellow_concrete': 0xFED83D,
  'minecraft:lime_concrete': 0x80C71F,
  'minecraft:green_concrete': 0x5E7C16,
  'minecraft:cyan_concrete': 0x169C9C,
  'minecraft:light_blue_concrete': 0x3AB3DA,
  'minecraft:blue_concrete': 0x3C44AA,
  'minecraft:purple_concrete': 0x8932B8,
  'minecraft:magenta_concrete': 0xC74EBD,
  'minecraft:pink_concrete': 0xF38BAA,

  // Terracotta
  'minecraft:terracotta': 0x985E43,
  'minecraft:white_terracotta': 0xD1B1A1,
  'minecraft:orange_terracotta': 0xA15325,
  'minecraft:red_terracotta': 0x8E3C2E,

  // Default
  'default': 0x8B8B8B,
};

function getBlockColor(blockType: string): number {
  return BLOCK_COLORS[blockType] || BLOCK_COLORS['default'];
}

function ModelPreviewThree({ blocks, size = 120, clickable = false, draggable = false }: ModelPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: -0.5, y: 0.7 });
  const panOffset = useRef({ x: 0, y: 0 });
  const cameraDistance = useRef<number>(0);
  const cameraYOffset = useRef<number>(0);
  const wasDragging = useRef(false);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    try {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(5, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Create model group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Build geometry inline - optimize for large models by grouping by color
    const skipEdges = blocks.length > 1000; // Skip edges for large models
    const blocksByColor = new Map<number, BlockDisplayEntity[]>();

    // Group blocks by color for batching
    blocks.forEach((block) => {
      const color = getBlockColor(block.block);
      if (!blocksByColor.has(color)) {
        blocksByColor.set(color, []);
      }
      blocksByColor.get(color)!.push(block);
    });

    // Create instanced meshes for each color group
    blocksByColor.forEach((colorBlocks, color) => {
      const instancedMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color }),
        colorBlocks.length
      );

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3();

      colorBlocks.forEach((block, index) => {
        const scaleX = block.scale?.[0] ?? 1.0;
        const scaleY = block.scale?.[1] ?? 1.0;
        const scaleZ = block.scale?.[2] ?? 1.0;

        position.set(block.x, block.y + scaleY / 2, block.z);
        scale.set(scaleX, scaleY, scaleZ);

        matrix.compose(position, new THREE.Quaternion(), scale);
        instancedMesh.setMatrixAt(index, matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      modelGroup.add(instancedMesh);

      // Add edge lines only for small models
      if (!skipEdges && colorBlocks.length < 100) {
        colorBlocks.forEach((block) => {
          const scaleX = block.scale?.[0] ?? 1.0;
          const scaleY = block.scale?.[1] ?? 1.0;
          const scaleZ = block.scale?.[2] ?? 1.0;

          const edgeGeometry = new THREE.BoxGeometry(scaleX, scaleY, scaleZ);
          const edges = new THREE.EdgesGeometry(edgeGeometry);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            opacity: 0.2,
            transparent: true
          });
          const lineSegments = new THREE.LineSegments(edges, lineMaterial);
          lineSegments.position.set(block.x, block.y + scaleY / 2, block.z);
          modelGroup.add(lineSegments);
          edgeGeometry.dispose();
        });
      }
    });

    // Calculate bounds and fit camera
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const modelSize = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Zoom out a bit

    // Center model at origin FIRST
    modelGroup.position.sub(center);

    // Then position camera to look at origin (where model now is)
    const camY = maxDim * 0.5;
    camera.position.set(0, camY, cameraZ);
    camera.lookAt(0, 0, 0);

    // Store initial camera distance and Y offset for zoom/pan
    cameraDistance.current = cameraZ;
    cameraYOffset.current = camY;

    // Apply initial rotation
    modelGroup.rotation.x = rotation.current.x;
    modelGroup.rotation.y = rotation.current.y;

    // Render
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
    } catch (error) {
      console.error('[ModelPreviewThree] Error in useEffect:', error);
      throw error;
    }
  }, [blocks, size]);

  // Handle mouse events for rotation (left-click drag)
  useEffect(() => {
    if (!draggable || !isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!modelGroupRef.current) return;

      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      rotation.current.y += deltaX * 0.01;
      rotation.current.x += deltaY * 0.01;

      // Clamp X rotation to prevent flipping
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));

      modelGroupRef.current.rotation.x = rotation.current.x;
      modelGroupRef.current.rotation.y = rotation.current.y;

      dragStart.current = { x: e.clientX, y: e.clientY };
      wasDragging.current = true;

      // Use requestAnimationFrame for smoother rendering
      if (animationFrameRef.current === null && rendererRef.current && sceneRef.current && cameraRef.current) {
        animationFrameRef.current = requestAnimationFrame(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          animationFrameRef.current = null;
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggable, isDragging]);

  // Handle panning (right-click drag)
  useEffect(() => {
    if (!draggable || !isPanning) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current) return;

      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      // Pan speed based on camera distance
      const panSpeed = cameraDistance.current * 0.001;

      panOffset.current.x -= deltaX * panSpeed;
      panOffset.current.y += deltaY * panSpeed;

      cameraRef.current.position.x = panOffset.current.x;
      cameraRef.current.position.y = cameraYOffset.current + panOffset.current.y;

      dragStart.current = { x: e.clientX, y: e.clientY };
      wasDragging.current = true;

      // Use requestAnimationFrame for smoother rendering
      if (animationFrameRef.current === null && rendererRef.current && sceneRef.current) {
        animationFrameRef.current = requestAnimationFrame(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          animationFrameRef.current = null;
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggable, isPanning]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    e.preventDefault();

    // Right-click (button 2) for panning, left-click (button 0) for rotation
    if (e.button === 2) {
      setIsPanning(true);
    } else if (e.button === 0) {
      setIsDragging(true);
    }

    wasDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = () => {
    // Only open modal if we didn't drag and clickable is enabled
    if (clickable && !wasDragging.current) {
      setShowModal(true);
    }
    wasDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!draggable || !cameraRef.current) return;

    e.preventDefault();

    // Zoom by adjusting camera Z position
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

    cameraDistance.current *= delta;

    // Clamp zoom to reasonable limits
    const minDistance = cameraDistance.current * 0.2;
    const maxDistance = cameraDistance.current * 5;
    cameraDistance.current = Math.max(minDistance, Math.min(maxDistance, cameraDistance.current));

    cameraRef.current.position.z = cameraDistance.current;

    // Render
    if (rendererRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  return (
    <>
      <div
        style={{ position: 'relative', width: size, height: size }}
      >
        <div
          ref={containerRef}
          className={`model-preview-container ${clickable ? 'clickable' : ''}`}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onWheel={handleWheel}
          onContextMenu={(e) => draggable && e.preventDefault()}
          style={{
            width: size,
            height: size,
            cursor: draggable ? (isDragging ? 'grabbing' : (isPanning ? 'move' : 'grab')) : (clickable ? 'pointer' : 'default'),
            userSelect: 'none',
          }}
          title={draggable ? 'Left-drag: rotate, Right-drag: pan, Scroll: zoom' : (clickable ? 'Click to view full size' : '')}
        />
        {draggable && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: '1.4',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div>Left-click: Rotate</div>
            <div>Right-click: Pan</div>
            <div>Scroll: Zoom</div>
          </div>
        )}
      </div>

      {clickable && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Model Preview"
          actions={
            <button className="modal-btn modal-btn-primary" onClick={() => setShowModal(false)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <ModelPreviewThree blocks={blocks} size={400} clickable={false} draggable={true} />
          </div>
        </Modal>
      )}
    </>
  );
}

export default ModelPreviewThree;
