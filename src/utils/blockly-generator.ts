import * as Blockly from 'blockly';

// Import the Java code generator
// @ts-ignore - JavaScript file
import { generateJavaCode } from '../../generators/java.js';
import { dbGetAiModels, dbGetAiModelBlocks } from './database';

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
  javaCode?: string;
  commands?: any[];
  events?: any[];
  blockDisplayModels?: any[];
  modelVariants?: { [modelId: string]: string[] }; // e.g. { "model_123": ["scale_2", "scale_10"] }
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
export async function generateModData(workspace: Blockly.WorkspaceSvg): Promise<ModData> {
  const modData: ModData = {
    customItems: [],
    customMobs: [],
    blockDisplayModels: [],
  };

  // Get all top-level blocks
  const blocks = workspace.getAllBlocks(false);

  // Collect model IDs and their scale/rotation parameters from spawn blocks
  const modelIds = new Set<string>();
  const modelVariants = new Map<string, Set<string>>(); // modelId -> Set of variant keys like "scale_2" or "rotation_90"

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

    // Extract AI model IDs from spawn blocks and track variants
    const modelId = block.getFieldValue('MODEL_ID');
    if (modelId) {
      if (block.type === 'spawn_ai_model_scaled') {
        const scale = parseFloat(block.getFieldValue('SCALE') || '1');
        modelIds.add(modelId);
        if (!modelVariants.has(modelId)) {
          modelVariants.set(modelId, new Set());
        }
        modelVariants.get(modelId)!.add(`scale_${scale}`);
      } else if (block.type === 'spawn_ai_model_rotated') {
        const rotation = parseFloat(block.getFieldValue('ROTATION') || '0');
        modelIds.add(modelId);
        if (!modelVariants.has(modelId)) {
          modelVariants.set(modelId, new Set());
        }
        modelVariants.get(modelId)!.add(`rotation_${rotation}`);
      } else if (block.type === 'spawn_ai_model_spinning' ||
                 block.type === 'spawn_ai_model_following' ||
                 block.type === 'spawn_ai_model_orbiting' ||
                 block.type === 'spawn_ai_model_circle' ||
                 block.type === 'spawn_block_display_model') {
        modelIds.add(modelId);
      }
    }
  }

  // Fetch AI model data from database
  if (modelIds.size > 0) {
    console.log('[Generator] Found AI model IDs:', Array.from(modelIds));
    try {
      const allModels = await dbGetAiModels();
      console.log('[Generator] Fetched', allModels.length, 'AI models from database');
      for (const modelId of modelIds) {
        const modelData = allModels.find(m => m.model_id === modelId);
        if (modelData) {
          console.log('[Generator] Found model data for', modelId);
          // Fetch the actual blocks_json (lazy loaded for performance)
          const blocksJson = await dbGetAiModelBlocks(modelId);
          modelData.blocks_json = blocksJson;
          console.log('[Generator] Loaded', blocksJson.length, 'bytes of blocks_json for', modelId);
          modData.blockDisplayModels!.push(modelData);
        } else {
          console.warn('[Generator] Model not found in database:', modelId);
        }
      }
      console.log('[Generator] Total blockDisplayModels:', modData.blockDisplayModels!.length);
    } catch (error) {
      console.error('Error fetching AI models:', error);
    }
  }

  // Convert modelVariants Map to plain object
  if (modelVariants.size > 0) {
    modData.modelVariants = {};
    for (const [modelId, variants] of modelVariants.entries()) {
      modData.modelVariants[modelId] = Array.from(variants);
    }
    console.log('[Generator] Model variants:', modData.modelVariants);
  }

  // Generate Java code from blocks using the JavaScript generator
  try {
    const javaData = generateJavaCode(workspace);
    modData.commands = javaData.commands;
    modData.events = javaData.events;

    // Build the complete Java code from commands and events
    let javaCode = '';
    if (javaData.commands && javaData.commands.length > 0) {
      for (const cmd of javaData.commands) {
        javaCode += cmd.code + '\n';
      }
    }
    if (javaData.events && javaData.events.length > 0) {
      for (const evt of javaData.events) {
        javaCode += evt.code + '\n';
      }
    }
    modData.javaCode = javaCode;
  } catch (error) {
    console.error('Error generating Java code:', error);
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
