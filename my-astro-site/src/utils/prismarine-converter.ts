/**
 * Convert voxel blocks to Prismarine chunk format for Minecraft rendering
 */

export interface VoxelBlock {
  block: string;
  x: number;
  y: number;
  z: number;
  scale: number[];
}

// Cache for unmapped blocks to avoid logging thousands of times
const loggedUnmappedBlocks = new Set<string>();

/**
 * Map simplified block names to Minecraft block IDs
 */
const BLOCK_MAP: Record<string, string> = {
  // Vanilla blocks
  'stone': 'stone',
  'dirt': 'dirt',
  'grass': 'grass_block',
  'sand': 'sand',
  'wood': 'oak_planks',
  'planks': 'oak_planks',
  'oak_planks': 'oak_planks',
  'glass': 'glass',
  'concrete': 'white_concrete',
  'wool': 'white_wool',
  'terracotta': 'terracotta',
  'iron': 'iron_block',
  'gold': 'gold_block',
  'diamond': 'diamond_block',
  'emerald': 'emerald_block',
  'obsidian': 'obsidian',
  'bedrock': 'bedrock',
  'water': 'water',
  'lava': 'lava',
  'sandstone': 'sandstone',
  'magma_block': 'magma_block',
  'copper_block': 'copper_block',
  'blackstone': 'blackstone',
  'marble': 'quartz_block_side', // No vanilla marble, use quartz

  // Colored blocks (map to concrete)
  'white': 'white_concrete',
  'white_concrete': 'white_concrete',
  'orange': 'orange_concrete',
  'orange_concrete': 'orange_concrete',
  'magenta': 'magenta_concrete',
  'magenta_concrete': 'magenta_concrete',
  'light_blue': 'light_blue_concrete',
  'light_blue_concrete': 'light_blue_concrete',
  'yellow': 'yellow_concrete',
  'yellow_concrete': 'yellow_concrete',
  'lime': 'lime_concrete',
  'lime_concrete': 'lime_concrete',
  'pink': 'pink_concrete',
  'pink_concrete': 'pink_concrete',
  'gray': 'gray_concrete',
  'gray_concrete': 'gray_concrete',
  'light_gray': 'light_gray_concrete',
  'light_gray_concrete': 'light_gray_concrete',
  'cyan': 'cyan_concrete',
  'cyan_concrete': 'cyan_concrete',
  'purple': 'purple_concrete',
  'purple_concrete': 'purple_concrete',
  'blue': 'blue_concrete',
  'blue_concrete': 'blue_concrete',
  'brown': 'brown_concrete',
  'brown_concrete': 'brown_concrete',
  'green': 'green_concrete',
  'green_concrete': 'green_concrete',
  'red': 'red_concrete',
  'red_concrete': 'red_concrete',
  'black': 'black_concrete',
  'black_concrete': 'black_concrete',

  // Concrete powder variants
  'white_concrete_powder': 'white_concrete_powder',
  'orange_concrete_powder': 'orange_concrete_powder',
  'magenta_concrete_powder': 'magenta_concrete_powder',
  'light_blue_concrete_powder': 'light_blue_concrete_powder',
  'yellow_concrete_powder': 'yellow_concrete_powder',
  'lime_concrete_powder': 'lime_concrete_powder',
  'pink_concrete_powder': 'pink_concrete_powder',
  'gray_concrete_powder': 'gray_concrete_powder',
  'light_gray_concrete_powder': 'light_gray_concrete_powder',
  'cyan_concrete_powder': 'cyan_concrete_powder',
  'purple_concrete_powder': 'purple_concrete_powder',
  'blue_concrete_powder': 'blue_concrete_powder',
  'brown_concrete_powder': 'brown_concrete_powder',
  'green_concrete_powder': 'green_concrete_powder',
  'red_concrete_powder': 'red_concrete_powder',
  'black_concrete_powder': 'black_concrete_powder',

  // Common materials
  'brick': 'bricks',
  'bricks': 'bricks',
  'cobblestone': 'cobblestone',
  'stone_bricks': 'stone_bricks',
  'oak_log': 'oak_log',
  'spruce_log': 'spruce_log',
  'birch_log': 'birch_log',
  'jungle_log': 'jungle_log',
  'acacia_log': 'acacia_log',
  'dark_oak_log': 'dark_oak_log',
  'oak_leaves': 'oak_leaves',
  'spruce_leaves': 'spruce_leaves',
  'leaves': 'oak_leaves',
  'glowstone': 'glowstone',
  'sea_lantern': 'sea_lantern',
  'quartz': 'quartz_block_side',
  'quartz_block': 'quartz_block_side',
  'prismarine': 'prismarine',
  'netherrack': 'netherrack',
  'end_stone': 'end_stone',

  // Planks variants
  'spruce_planks': 'spruce_planks',
  'birch_planks': 'birch_planks',
  'jungle_planks': 'jungle_planks',
  'acacia_planks': 'acacia_planks',
  'dark_oak_planks': 'dark_oak_planks',

  // Terracotta
  'white_terracotta': 'white_terracotta',
  'orange_terracotta': 'orange_terracotta',
  'yellow_terracotta': 'yellow_terracotta',
  'brown_terracotta': 'brown_terracotta',
  'red_terracotta': 'red_terracotta',
  'light_blue_terracotta': 'light_blue_terracotta',

  // Glass variants
  'light_blue_stained_glass': 'light_blue_stained_glass',
  'stained_glass': 'glass',
};

/**
 * Convert a simplified block name to a Minecraft block ID
 */
export function mapBlockType(blockName: string): string {
  const originalBlockName = blockName;

  // Remove minecraft: prefix if present
  blockName = blockName.replace('minecraft:', '');

  // Fix various AI duplication patterns
  const parts = blockName.split('_');

  // Pattern 1: Exact half duplication (e.g., "sand_sand" -> "sand")
  const halfLen = Math.floor(parts.length / 2);
  if (parts.length > 1 && parts.length % 2 === 0) {
    const firstHalf = parts.slice(0, halfLen).join('_');
    const secondHalf = parts.slice(halfLen).join('_');
    if (firstHalf === secondHalf) {
      blockName = firstHalf;
    }
  }

  // Pattern 2: Adjacent duplicates (e.g., "brown_brown_terracotta" -> "brown_terracotta")
  const deduped: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i === 0 || parts[i] !== parts[i - 1]) {
      deduped.push(parts[i]);
    }
  }
  if (deduped.length < parts.length) {
    blockName = deduped.join('_');
  }

  // Pattern 3: First and last part same (e.g., "terracotta_red_terracotta" -> "red_terracotta")
  const dedupedParts = blockName.split('_');
  if (dedupedParts.length >= 3 && dedupedParts[0] === dedupedParts[dedupedParts.length - 1]) {
    blockName = dedupedParts.slice(1).join('_');
  }

  // Try direct mapping
  if (BLOCK_MAP[blockName]) {
    return BLOCK_MAP[blockName];
  }

  // Try lowercase
  const lower = blockName.toLowerCase();
  if (BLOCK_MAP[lower]) {
    return BLOCK_MAP[lower];
  }

  // If still not found, try without the last part (e.g., "spruce_planks" -> "planks")
  if (blockName.includes('_')) {
    const baseName = blockName.split('_').pop();
    if (baseName && BLOCK_MAP[baseName]) {
      return BLOCK_MAP[baseName];
    }
  }

  // No mapping found - log once per unique block type
  if (!loggedUnmappedBlocks.has(blockName)) {
    loggedUnmappedBlocks.add(blockName);
    console.log(`[prismarine-converter] No mapping for "${originalBlockName}" (cleaned: "${blockName}"), using as-is`);
  }

  // Return the cleaned block name - the texture loader will try to find it automatically
  return blockName;
}

/**
 * Get bounding box of voxel blocks
 */
export function getBoundingBox(blocks: VoxelBlock[]) {
  if (blocks.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
  }

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

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

/**
 * Convert voxel blocks to a simple 3D block array for Prismarine
 * Returns an array of { x, y, z, blockName } objects
 */
export function convertVoxelsToPrismarineBlocks(blocks: VoxelBlock[], placementMode: string = 'blocks') {
  const prismarineBlocks: Array<{ x: number; y: number; z: number; blockName: string }> = [];

  // If in "blocks" mode, scale up and snap to grid (like we do for viewer)
  if (placementMode === 'blocks') {
    const seen = new Set<string>();

    for (const block of blocks) {
      const blockScale = block.scale ? block.scale[0] : 0.22;
      const upscaleFactor = 1.0 / blockScale;

      // Scale up and round
      const x = Math.round(block.x * upscaleFactor);
      const y = Math.round(block.y * upscaleFactor);
      const z = Math.round(block.z * upscaleFactor);

      const key = `${x},${y},${z}`;

      if (!seen.has(key)) {
        seen.add(key);
        prismarineBlocks.push({
          x,
          y,
          z,
          blockName: mapBlockType(block.block),
        });
      }
    }
  } else {
    // Display mode: keep fractional (round to nearest)
    const seen = new Set<string>();

    for (const block of blocks) {
      const x = Math.round(block.x);
      const y = Math.round(block.y);
      const z = Math.round(block.z);

      const key = `${x},${y},${z}`;

      if (!seen.has(key)) {
        seen.add(key);
        prismarineBlocks.push({
          x,
          y,
          z,
          blockName: mapBlockType(block.block),
        });
      }
    }
  }

  return prismarineBlocks;
}
