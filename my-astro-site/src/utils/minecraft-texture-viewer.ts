/**
 * Minecraft-Style Viewer with Real Textures
 * Uses Three.js to render blocks with actual Minecraft textures
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Auto-detect per-face textures based on the found texture file
function getPerFaceTextureConfig(textureFile: string): { top: string; bottom: string; sides: string } | null {
  // If fuzzy matching found a _top texture, automatically derive side and bottom
  if (textureFile.endsWith('_top.png')) {
    const baseName = textureFile.replace('_top.png', '');
    return {
      top: textureFile,  // Already found by fuzzy matching
      bottom: `${baseName}_bottom.png`,  // Try bottom variant
      sides: `${baseName}_side.png`  // Try side variant
    };
  }

  return null;
}

// Texture mapping: simplified name -> texture filename
const TEXTURE_MAP: Record<string, string> = {
  'stone': 'stone.png',
  'dirt': 'dirt.png',
  'grass': 'grass_block_side.png',
  'grass_block': 'grass_block_side.png',
  'sand': 'sand.png',
  'wood': 'oak_planks.png',
  'planks': 'oak_planks.png',
  'oak_planks': 'oak_planks.png',
  'glass': 'glass.png',
  'white_concrete': 'white_concrete.png',
  'orange_concrete': 'orange_concrete.png',
  'magenta_concrete': 'magenta_concrete.png',
  'light_blue_concrete': 'light_blue_concrete.png',
  'yellow_concrete': 'yellow_concrete.png',
  'lime_concrete': 'lime_concrete.png',
  'pink_concrete': 'pink_concrete.png',
  'gray_concrete': 'gray_concrete.png',
  'light_gray_concrete': 'light_gray_concrete.png',
  'cyan_concrete': 'cyan_concrete.png',
  'purple_concrete': 'purple_concrete.png',
  'blue_concrete': 'blue_concrete.png',
  'brown_concrete': 'brown_concrete.png',
  'green_concrete': 'green_concrete.png',
  'red_concrete': 'red_concrete.png',
  'black_concrete': 'black_concrete.png',
  'white': 'white_concrete.png',
  'orange': 'orange_concrete.png',
  'yellow': 'yellow_concrete.png',
  'lime': 'lime_concrete.png',
  'pink': 'pink_concrete.png',
  'gray': 'gray_concrete.png',
  'cyan': 'cyan_concrete.png',
  'purple': 'purple_concrete.png',
  'blue': 'blue_concrete.png',
  'brown': 'brown_concrete.png',
  'green': 'green_concrete.png',
  'red': 'red_concrete.png',
  'black': 'black_concrete.png',
  'concrete': 'white_concrete.png',
  'wool': 'white_wool.png',
  'white_wool': 'white_wool.png',
  'terracotta': 'terracotta.png',
  'iron': 'iron_block.png',
  'iron_block': 'iron_block.png',
  'gold': 'gold_block.png',
  'gold_block': 'gold_block.png',
  'diamond': 'diamond_block.png',
  'diamond_block': 'diamond_block.png',
  'emerald': 'emerald_block.png',
  'emerald_block': 'emerald_block.png',
  'obsidian': 'obsidian.png',
  'bedrock': 'bedrock.png',
  'brick': 'bricks.png',
  'bricks': 'bricks.png',
  'cobblestone': 'cobblestone.png',
  'stone_bricks': 'stone_bricks.png',
  'oak_log': 'oak_log.png',
  'spruce_log': 'spruce_log.png',
  'birch_log': 'birch_log.png',
  'jungle_log': 'jungle_log.png',
  'leaves': 'oak_leaves.png',
  'oak_leaves': 'oak_leaves.png',
  'glowstone': 'glowstone.png',
  'sea_lantern': 'sea_lantern.png',
  'quartz': 'quartz_block_side.png',
  'quartz_block': 'quartz_block_side.png',
  'prismarine': 'prismarine.png',
  'netherrack': 'netherrack.png',
  'end_stone': 'end_stone.png',
  'water': 'water_still.png',
  'lava': 'lava_still.png',
};

export class MinecraftTextureViewer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  textureLoader: THREE.TextureLoader;
  textureCache: Map<string, THREE.Texture> = new Map();
  container: HTMLElement;
  animationId: number | null = null;

  // View compass/gizmo
  compassScene: THREE.Scene;
  compassCamera: THREE.OrthographicCamera;
  compassRenderer: THREE.WebGLRenderer;
  compassSize = 128;
  isAnimatingCamera = false;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} not found`);
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue like Minecraft

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false }); // Pixelated like Minecraft
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(1); // Keep it pixel-perfect
    container.appendChild(this.renderer.domElement);

    // Lights - simple like Minecraft
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(50, 100, 50);
    this.scene.add(directionalLight);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 500;

    // Texture loader with nearest neighbor filtering (pixelated)
    this.textureLoader = new THREE.TextureLoader();

    // Initialize view compass
    this.compassScene = new THREE.Scene();
    this.compassCamera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
    this.compassCamera.position.set(0, 0, 10);

    this.compassRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.compassRenderer.setSize(this.compassSize, this.compassSize);
    this.compassRenderer.domElement.style.position = 'absolute';
    this.compassRenderer.domElement.style.top = '10px';
    this.compassRenderer.domElement.style.right = '10px';
    this.compassRenderer.domElement.style.cursor = 'pointer';
    this.compassRenderer.domElement.style.borderRadius = '8px';
    this.compassRenderer.domElement.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    this.compassRenderer.domElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    container.appendChild(this.compassRenderer.domElement);

    this.initCompass();
    this.setupCompassClickHandling();

    // Start animation
    this.animate();
  }

  initCompass() {
    // Create axes group
    const axesGroup = new THREE.Group();

    // X axis (red) - pointing right
    const xGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = 0.75;

    // X cone (arrow tip)
    const xCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.3, 8),
      xMaterial
    );
    xCone.rotation.z = -Math.PI / 2;
    xCone.position.x = 1.65;

    // Y axis (green) - pointing up
    const yGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    yAxis.position.y = 0.75;

    // Y cone
    const yCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.3, 8),
      yMaterial
    );
    yCone.position.y = 1.65;

    // Z axis (blue) - pointing forward
    const zGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = 0.75;

    // Z cone
    const zCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.3, 8),
      zMaterial
    );
    zCone.rotation.x = -Math.PI / 2;
    zCone.position.z = 1.65;

    axesGroup.add(xAxis, xCone, yAxis, yCone, zAxis, zCone);

    // Add a subtle sphere at center
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xcccccc })
    );
    axesGroup.add(centerSphere);

    this.compassScene.add(axesGroup);
  }

  setupCompassClickHandling() {
    const views = {
      front: { position: [0, 0, 1], target: [0, 0, 0] },
      back: { position: [0, 0, -1], target: [0, 0, 0] },
      left: { position: [-1, 0, 0], target: [0, 0, 0] },
      right: { position: [1, 0, 0], target: [0, 0, 0] },
      top: { position: [0, 1, 0], target: [0, 0, 0] },
      bottom: { position: [0, -1, 0], target: [0, 0, 0] }
    };

    this.compassRenderer.domElement.addEventListener('click', (event) => {
      const rect = this.compassRenderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Determine which face was clicked based on position
      let selectedView: keyof typeof views | null = null;

      if (Math.abs(x) > Math.abs(y)) {
        selectedView = x > 0 ? 'right' : 'left';
      } else {
        selectedView = y > 0 ? 'top' : 'bottom';
      }

      // Check if click is more towards front/back (based on distance from center)
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < 0.5) {
        // If clicking near center, determine front/back based on subtle differences
        if (Math.abs(x) < 0.3 && Math.abs(y) < 0.3) {
          selectedView = 'front'; // Default to front when clicking center
        }
      }

      if (selectedView) {
        this.snapToView(selectedView, views[selectedView]);
      }
    });
  }

  snapToView(viewName: string, view: { position: number[], target: number[] }) {
    if (this.isAnimatingCamera) return;

    this.isAnimatingCamera = true;

    // Get current target
    const currentTarget = this.controls.target.clone();
    const targetPos = new THREE.Vector3(...view.target as [number, number, number]);

    // Calculate distance to maintain
    const currentDistance = this.camera.position.distanceTo(currentTarget);

    // Calculate new position
    const direction = new THREE.Vector3(...view.position as [number, number, number]);
    const newPosition = targetPos.clone().add(direction.multiplyScalar(currentDistance));

    // Animate camera
    const startPosition = this.camera.position.clone();
    const startTime = performance.now();
    const duration = 500; // ms

    const animateCamera = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPosition, newPosition, eased);
      this.camera.lookAt(targetPos);
      this.controls.target.copy(targetPos);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        this.isAnimatingCamera = false;
      }
    };

    animateCamera();
  }

  findBestTextureMatch(blockName: string): string {
    // Clean up block name
    let cleanName = blockName.replace('minecraft:', '');

    // Fix AI duplication patterns
    const parts = cleanName.split('_');
    const halfLen = Math.floor(parts.length / 2);
    if (parts.length > 1 && parts.length % 2 === 0) {
      const firstHalf = parts.slice(0, halfLen).join('_');
      const secondHalf = parts.slice(halfLen).join('_');
      if (firstHalf === secondHalf) cleanName = firstHalf;
    }

    const deduped: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (i === 0 || parts[i] !== parts[i - 1]) deduped.push(parts[i]);
    }
    if (deduped.length < parts.length) cleanName = deduped.join('_');

    const dedupedParts = cleanName.split('_');
    if (dedupedParts.length >= 3 && dedupedParts[0] === dedupedParts[dedupedParts.length - 1]) {
      cleanName = dedupedParts.slice(1).join('_');
    }

    // Try exact mapping
    if (TEXTURE_MAP[cleanName]) return TEXTURE_MAP[cleanName];

    // Fuzzy matching for common cases
    const specialCases: Record<string, string> = {
      'lava': 'lava_still.png',
      'water': 'water_still.png',
      'grass': 'grass_block_side.png',
    };

    if (specialCases[cleanName]) {
      console.log(`[MinecraftViewer] Fuzzy match: "${blockName}" -> "${specialCases[cleanName]}"`);
      return specialCases[cleanName];
    }

    // Handle doors (they have _bottom and _top textures, use bottom for voxels)
    if (cleanName.endsWith('_door')) {
      const doorTexture = `${cleanName}_bottom.png`;
      console.log(`[MinecraftViewer] Door texture: "${blockName}" -> "${doorTexture}"`);
      return doorTexture;
    }

    return `${cleanName}.png`;
  }

  getTexture(blockName: string): THREE.Texture {
    // Check cache first
    if (this.textureCache.has(blockName)) {
      return this.textureCache.get(blockName)!;
    }

    const textureFile = this.findBestTextureMatch(blockName);
    const texturePath = `/textures/block/${textureFile}`;

    const texture = this.textureLoader.load(
      texturePath,
      () => {},
      undefined,
      (error) => {
        console.warn(`[MinecraftViewer] Texture not found for "${blockName}": ${texturePath}, defaulting to stone.png`);
      }
    );

    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    this.textureCache.set(blockName, texture);
    return texture;
  }

  getMaterials(blockName: string): THREE.Material | THREE.Material[] {
    // First, use fuzzy matching to find the best texture
    const textureFile = this.findBestTextureMatch(blockName);

    // Check if this texture has per-face variants (e.g., ends with _top.png)
    const perFaceConfig = getPerFaceTextureConfig(textureFile);

    if (perFaceConfig) {
      // Load textures for each face
      const loadTex = (filename: string) => {
        const path = `/textures/block/${filename}`;
        const tex = this.textureLoader.load(path);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        return tex;
      };

      const top = loadTex(perFaceConfig.top);
      const bottom = loadTex(perFaceConfig.bottom);
      const sides = loadTex(perFaceConfig.sides);

      // Create materials for each face: [right, left, top, bottom, front, back]
      return [
        new THREE.MeshLambertMaterial({ map: sides }),  // right (+X)
        new THREE.MeshLambertMaterial({ map: sides }),  // left (-X)
        new THREE.MeshLambertMaterial({ map: top }),    // top (+Y)
        new THREE.MeshLambertMaterial({ map: bottom }), // bottom (-Y)
        new THREE.MeshLambertMaterial({ map: sides }),  // front (+Z)
        new THREE.MeshLambertMaterial({ map: sides }),  // back (-Z)
      ];
    } else {
      // Single texture for all faces
      const texture = this.getTexture(blockName);
      return new THREE.MeshLambertMaterial({ map: texture });
    }
  }

  async loadBlocks(blocks: Array<{ x: number; y: number; z: number; blockName: string }>) {
    // Clear existing blocks
    while (this.scene.children.length > 2) { // Keep lights
      this.scene.remove(this.scene.children[2]);
    }

    console.log(`[MinecraftViewer] Loading ${blocks.length.toLocaleString()} blocks...`);
    const startTime = performance.now();

    // Group blocks by type for instancing
    const blocksByType = new Map<string, Array<{x: number, y: number, z: number}>>();

    // Process blocks in batches to keep UI responsive
    const BATCH_SIZE = 10000;
    for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
      const batch = blocks.slice(i, Math.min(i + BATCH_SIZE, blocks.length));

      batch.forEach(block => {
        if (!blocksByType.has(block.blockName)) {
          blocksByType.set(block.blockName, []);
        }
        blocksByType.get(block.blockName)!.push({ x: block.x, y: block.y, z: block.z });
      });

      // Let browser breathe between batches
      if (i + BATCH_SIZE < blocks.length) {
        await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
      }
    }

    console.log(`[MinecraftViewer] Grouped into ${blocksByType.size} block types in ${(performance.now() - startTime).toFixed(0)}ms`);

    // Create instanced meshes for each block type
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    let meshCount = 0;

    for (const [blockName, positions] of blocksByType.entries()) {
      const materials = this.getMaterials(blockName);
      const mesh = new THREE.InstancedMesh(geometry, materials, positions.length);

      // Process positions in batches
      const MATRIX_BATCH_SIZE = 5000;
      for (let i = 0; i < positions.length; i += MATRIX_BATCH_SIZE) {
        const batchEnd = Math.min(i + MATRIX_BATCH_SIZE, positions.length);

        for (let j = i; j < batchEnd; j++) {
          const matrix = new THREE.Matrix4();
          matrix.setPosition(positions[j].x, positions[j].y, positions[j].z);
          mesh.setMatrixAt(j, matrix);
        }

        // Let browser breathe
        if (batchEnd < positions.length) {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      this.scene.add(mesh);
      meshCount++;

      // Breathe after adding each mesh
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
    }

    console.log(`[MinecraftViewer] Created ${meshCount} meshes in ${(performance.now() - startTime).toFixed(0)}ms`);

    // Center camera on model
    if (blocks.length > 0) {
      const centerX = blocks.reduce((sum, b) => sum + b.x, 0) / blocks.length;
      const centerY = blocks.reduce((sum, b) => sum + b.y, 0) / blocks.length;
      const centerZ = blocks.reduce((sum, b) => sum + b.z, 0) / blocks.length;

      // Find max distance using loop to avoid stack overflow with spread operator
      let maxDist = 0;
      for (const b of blocks) {
        const dist = Math.sqrt((b.x - centerX) ** 2 + (b.y - centerY) ** 2 + (b.z - centerZ) ** 2);
        if (dist > maxDist) maxDist = dist;
      }

      this.camera.position.set(
        centerX + maxDist * 2,
        centerY + maxDist,
        centerZ + maxDist * 2
      );
      this.camera.lookAt(centerX, centerY, centerZ);
      this.controls.target.set(centerX, centerY, centerZ);
    }

    console.log(`[MinecraftViewer] Loaded ${blocks.length} blocks with real textures`);
  }

  animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    // Update compass to match main camera orientation
    if (this.compassScene.children.length > 0) {
      const axesGroup = this.compassScene.children[0];
      axesGroup.quaternion.copy(this.camera.quaternion).invert();
      this.compassRenderer.render(this.compassScene, this.compassCamera);
    }
  };

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }

    // Clean up compass
    this.compassRenderer.dispose();
    if (this.container.contains(this.compassRenderer.domElement)) {
      this.container.removeChild(this.compassRenderer.domElement);
    }
  }
}
