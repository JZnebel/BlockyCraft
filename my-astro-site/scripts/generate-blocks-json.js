#!/usr/bin/env node

/**
 * Generate blocks.json from Faithful texture pack
 *
 * This script scans all block textures and creates a comprehensive
 * block database with categories, display names, and metadata.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEXTURES_DIR = path.join(__dirname, '../public/textures/block');
const OUTPUT_FILE = path.join(__dirname, '../public/blocks.json');

// Category patterns - order matters (most specific first)
const CATEGORIES = [
  // Wood types
  { id: 'wood', name: 'Wood & Planks', pattern: /_(planks|log|wood|stripped)/, priority: 1 },
  { id: 'wood', name: 'Wood & Planks', pattern: /^(oak|birch|spruce|jungle|acacia|dark_oak|crimson|warped|bamboo|cherry|mangrove)_/, priority: 1 },

  // Stone variants
  { id: 'stone', name: 'Stone & Bricks', pattern: /stone|brick|cobble|andesite|diorite|granite/, priority: 2 },

  // Ores & minerals
  { id: 'ores', name: 'Ores & Minerals', pattern: /_ore|coal_block|iron_block|gold_block|diamond_block|emerald_block|netherite_block|copper_block|amethyst/, priority: 3 },

  // Glass & translucent
  { id: 'glass', name: 'Glass & Transparent', pattern: /glass|ice/, priority: 4 },

  // Concrete & terracotta
  { id: 'concrete', name: 'Concrete & Terracotta', pattern: /concrete|terracotta/, priority: 5 },

  // Wool & carpet
  { id: 'wool', name: 'Wool & Carpet', pattern: /wool|carpet/, priority: 6 },

  // Nature (plants, flowers, leaves)
  { id: 'nature', name: 'Plants & Nature', pattern: /leaves|sapling|flower|grass|fern|vine|mushroom|lily|cactus|bamboo|sugar_cane/, priority: 7 },

  // Nether blocks
  { id: 'nether', name: 'Nether Blocks', pattern: /nether|soul|basalt|blackstone|warped|crimson|glowstone|magma/, priority: 8 },

  // End blocks
  { id: 'end', name: 'End Blocks', pattern: /end_|purpur|chorus/, priority: 9 },

  // Lighting
  { id: 'lighting', name: 'Lighting', pattern: /lantern|torch|lamp|light|glowstone|shroomlight/, priority: 10 },

  // Doors, gates, trapdoors
  { id: 'doors', name: 'Doors & Gates', pattern: /_door|_gate|trapdoor/, priority: 11 },

  // Rails & redstone
  { id: 'redstone', name: 'Redstone & Rails', pattern: /rail|redstone|repeater|comparator|piston|dispenser|dropper|hopper|observer/, priority: 12 },

  // Decorative
  { id: 'decoration', name: 'Decorative', pattern: /stairs|slab|fence|wall|banner|bed|carpet/, priority: 13 },

  // Default
  { id: 'other', name: 'Other Blocks', pattern: /.*/, priority: 999 }
];

// Kid-friendly blocks (curated list for beginners)
const KID_FRIENDLY = new Set([
  'stone', 'cobblestone', 'stone_bricks', 'smooth_stone',
  'oak_planks', 'birch_planks', 'spruce_planks', 'jungle_planks', 'acacia_planks', 'dark_oak_planks',
  'oak_log', 'birch_log', 'spruce_log',
  'glass', 'white_stained_glass', 'red_stained_glass', 'blue_stained_glass', 'green_stained_glass', 'yellow_stained_glass',
  'dirt', 'grass_block', 'sand', 'gravel',
  'white_wool', 'red_wool', 'blue_wool', 'green_wool', 'yellow_wool', 'orange_wool', 'pink_wool', 'black_wool',
  'white_concrete', 'red_concrete', 'blue_concrete', 'green_concrete', 'yellow_concrete', 'orange_concrete', 'pink_concrete', 'black_concrete',
  'bricks', 'quartz_block', 'gold_block', 'iron_block', 'diamond_block', 'emerald_block',
  'oak_door_bottom', 'birch_door_bottom', 'spruce_door_bottom',
  'oak_leaves', 'birch_leaves', 'spruce_leaves',
  'torch', 'glowstone', 'sea_lantern',
  'snow_block', 'ice', 'packed_ice'
]);

// Common search tags
function generateTags(id) {
  const tags = [id];

  // Add color tags
  const colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
  colors.forEach(color => {
    if (id.includes(color)) tags.push(color);
  });

  // Add material tags
  if (id.includes('glass')) tags.push('transparent', 'see-through');
  if (id.includes('glow')) tags.push('light', 'bright');
  if (id.includes('stone')) tags.push('rock', 'hard');
  if (id.includes('wood') || id.includes('planks') || id.includes('log')) tags.push('wooden', 'tree');
  if (id.includes('concrete')) tags.push('smooth', 'modern');
  if (id.includes('wool')) tags.push('soft', 'fabric');

  return tags;
}

// Convert ID to display name
function toDisplayName(id) {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Categorize a block
function categorizeBlock(id) {
  for (const category of CATEGORIES) {
    if (category.pattern.test(id)) {
      return category.id;
    }
  }
  return 'other';
}

// Main function
function generateBlocksJson() {
  console.log('🔍 Scanning textures directory...');

  const files = fs.readdirSync(TEXTURES_DIR);
  const blocks = [];

  files.forEach(file => {
    if (!file.endsWith('.png')) return;

    const id = file.replace('.png', '');
    const category = categorizeBlock(id);
    const displayName = toDisplayName(id);
    const tags = generateTags(id);
    const kidFriendly = KID_FRIENDLY.has(id);

    // Special handling for doors (only include _bottom variant)
    if (id.endsWith('_door_top')) return;

    // Create clean ID (remove _bottom from doors for cleaner code)
    const cleanId = id.replace('_bottom', '');

    blocks.push({
      id: cleanId,
      textureFile: file,
      displayName,
      category,
      tags,
      kidFriendly,
      // Special flags
      hasVariants: file.includes('_bottom') || file.includes('_top') || file.includes('_side'),
      isDecorative: category === 'decoration',
      isTransparent: category === 'glass' || tags.includes('transparent')
    });
  });

  // Sort: kid-friendly first, then alphabetically
  blocks.sort((a, b) => {
    if (a.kidFriendly && !b.kidFriendly) return -1;
    if (!a.kidFriendly && b.kidFriendly) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  // Generate category summary
  const categoryStats = {};
  blocks.forEach(block => {
    categoryStats[block.category] = (categoryStats[block.category] || 0) + 1;
  });

  const output = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalBlocks: blocks.length,
    categories: CATEGORIES.filter(c => c.id !== 'other').map(c => ({ id: c.id, name: c.name })),
    categoryStats,
    blocks
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log('✅ Generated blocks.json');
  console.log(`   Total blocks: ${blocks.length}`);
  console.log(`   Kid-friendly: ${blocks.filter(b => b.kidFriendly).length}`);
  console.log(`   Categories: ${Object.keys(categoryStats).length}`);
  Object.entries(categoryStats).forEach(([cat, count]) => {
    console.log(`      ${cat}: ${count}`);
  });
  console.log(`   Output: ${OUTPUT_FILE}`);
}

// Run
try {
  generateBlocksJson();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
