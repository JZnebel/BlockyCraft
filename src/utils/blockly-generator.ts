import * as Blockly from 'blockly';

// Type definitions for our mod data structures
export interface CustomItem {
  name: string;
  textureSource: 'ai' | 'upload';
  textureDescription?: string;
  uploadedTexture?: string;
  baseItem: string;
  rarity: string;
  maxStack: number;
  recipe: string[];
}

export interface CustomMob {
  name: string;
  uploadedTexture?: string;
  health: number;
  size: number;
  speed: string;
  behavior: string;
}

export interface ModData {
  customItems: CustomItem[];
  customMobs: CustomMob[];
}

/**
 * Extract custom item data from a block
 */
function extractCustomItem(block: Blockly.Block): CustomItem | null {
  if (block.type !== 'custom_item_define') return null;

  const item: CustomItem = {
    name: block.getFieldValue('ITEM_NAME') || 'Custom Item',
    textureSource: block.getFieldValue('TEXTURE_SOURCE') as 'ai' | 'upload',
    baseItem: block.getFieldValue('BASE_ITEM') || 'minecraft:stick',
    rarity: block.getFieldValue('RARITY') || 'COMMON',
    maxStack: parseInt(block.getFieldValue('MAX_STACK')) || 1,
    recipe: [],
  };

  // Get texture data
  if (item.textureSource === 'ai') {
    item.textureDescription = block.getFieldValue('TEXTURE_DESCRIPTION') || '';
  } else {
    // Get uploaded texture from block's extra state
    const extraState = (block as any).uploadedTextureData;
    if (extraState) {
      item.uploadedTexture = extraState;
    }
  }

  // Get recipe (3x3 grid)
  for (let i = 1; i <= 9; i++) {
    const recipeItem = block.getFieldValue(`RECIPE_${i}`) || 'NONE';
    item.recipe.push(recipeItem);
  }

  return item;
}

/**
 * Extract custom mob data from a block
 */
function extractCustomMob(block: Blockly.Block): CustomMob | null {
  if (block.type !== 'custom_mob_define') return null;

  const mob: CustomMob = {
    name: block.getFieldValue('MOB_NAME') || 'Custom Mob',
    health: parseInt(block.getFieldValue('HEALTH')) || 20,
    size: parseFloat(block.getFieldValue('SIZE')) || 1.0,
    speed: block.getFieldValue('SPEED') || '0.35',
    behavior: block.getFieldValue('BEHAVIOR') || 'PASSIVE',
  };

  // Get uploaded texture from block's extra state
  const extraState = (block as any).uploadedTextureData;
  if (extraState) {
    mob.uploadedTexture = extraState;
  }

  return mob;
}

/**
 * Generate mod data from Blockly workspace
 */
export function generateModData(workspace: Blockly.WorkspaceSvg): ModData {
  const modData: ModData = {
    customItems: [],
    customMobs: [],
  };

  // Get all top-level blocks
  const blocks = workspace.getAllBlocks(false);

  for (const block of blocks) {
    // Extract custom items
    if (block.type === 'custom_item_define') {
      const item = extractCustomItem(block);
      if (item) {
        modData.customItems.push(item);
      }
    }

    // Extract custom mobs
    if (block.type === 'custom_mob_define') {
      const mob = extractCustomMob(block);
      if (mob) {
        modData.customMobs.push(mob);
      }
    }
  }

  return modData;
}

/**
 * Serialize workspace to JSON for saving
 */
export function serializeWorkspace(workspace: Blockly.WorkspaceSvg): string {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToText(xml);
  return xmlText;
}

/**
 * Deserialize workspace from JSON
 */
export function deserializeWorkspace(
  workspace: Blockly.WorkspaceSvg,
  xmlText: string
): void {
  workspace.clear();

  // Check if it's JSON format (starts with '{') or XML format
  const trimmed = xmlText.trim();
  if (trimmed.startsWith('{')) {
    // JSON format - parse and load
    try {
      const json = JSON.parse(xmlText);
      Blockly.serialization.workspaces.load(json, workspace);
    } catch (error) {
      console.error('Failed to parse JSON workspace:', error);
      throw error;
    }
  } else {
    // XML format
    const xml = Blockly.utils.xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
}

/**
 * Validate mod data before compilation
 */
export function validateModData(modData: ModData): string[] {
  const errors: string[] = [];

  // Check for duplicate item names
  const itemNames = new Set<string>();
  for (const item of modData.customItems) {
    if (itemNames.has(item.name)) {
      errors.push(`Duplicate item name: ${item.name}`);
    }
    itemNames.add(item.name);

    // Check if texture is provided
    if (item.textureSource === 'ai' && !item.textureDescription) {
      errors.push(`Item "${item.name}" needs an AI texture description`);
    }
    if (item.textureSource === 'upload' && !item.uploadedTexture) {
      errors.push(`Item "${item.name}" needs an uploaded texture`);
    }
  }

  // Check for duplicate mob names
  const mobNames = new Set<string>();
  for (const mob of modData.customMobs) {
    if (mobNames.has(mob.name)) {
      errors.push(`Duplicate mob name: ${mob.name}`);
    }
    mobNames.add(mob.name);

    // Check if texture is provided
    if (!mob.uploadedTexture) {
      errors.push(`Mob "${mob.name}" needs an uploaded texture`);
    }
  }

  return errors;
}

// Alias for deserializeWorkspace for backward compatibility
export const loadWorkspace = deserializeWorkspace;
