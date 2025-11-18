import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import type { ModData } from './blockly-generator';
import type { BlockDisplayEntity } from './database';

/**
 * Save project to a file using Tauri file dialog
 */
export async function saveProjectToFile(workspaceXml: string): Promise<void> {
  try {
    const filePath = await save({
      filters: [{
        name: 'BlocklyCraft Project',
        extensions: ['blocklycraft']
      }],
      defaultPath: 'my-mod.blocklycraft'
    });

    if (!filePath) {
      throw new Error('Save cancelled');
    }

    await invoke('save_project', {
      filePath,
      workspaceXml
    });
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
}

/**
 * Load project from a file using Tauri file dialog
 */
export async function loadProjectFromFile(): Promise<string> {
  try {
    const filePath = await open({
      filters: [{
        name: 'BlocklyCraft Project',
        extensions: ['blocklycraft']
      }],
      multiple: false
    });

    if (!filePath) {
      throw new Error('Open cancelled');
    }

    const workspaceXml = await invoke<string>('load_project', {
      filePath
    });

    return workspaceXml;
  } catch (error) {
    console.error('Error loading project:', error);
    throw error;
  }
}

/**
 * Build mod without deploying (saves to Downloads folder)
 */
export async function buildMod(modData: ModData, projectName: string): Promise<string> {
  try {
    const result = await invoke<string>('build_mod', {
      modData,
      projectName
    });

    return result;
  } catch (error) {
    console.error('Error building mod:', error);
    throw error;
  }
}

/**
 * Compile and deploy mod to server
 */
export async function compileMod(modData: ModData, projectName: string): Promise<string> {
  try {
    const result = await invoke<string>('compile_mod', {
      modData,
      projectName
    });

    return result;
  } catch (error) {
    console.error('Error compiling mod:', error);
    throw error;
  }
}

/**
 * Generate a block display model using AI (direct JSON generation)
 */
export async function generateBlockDisplayModel(
  apiKey: string,
  prompt: string,
  size: 'small' | 'medium' | 'large'
): Promise<BlockDisplayEntity[]> {
  try {
    const result = await invoke<BlockDisplayEntity[]>('generate_block_display_model', {
      apiKey,
      prompt,
      size
    });

    return result;
  } catch (error) {
    console.error('Error generating block display model:', error);
    throw error;
  }
}

/**
 * Generate a block display model using AI CodeGen (scientific/algorithmic generation)
 */
export async function generateBlockDisplayModelCodegen(
  apiKey: string,
  prompt: string,
  size: 'small' | 'medium' | 'large'
): Promise<BlockDisplayEntity[]> {
  try {
    const result = await invoke<BlockDisplayEntity[]>('generate_block_display_model_codegen', {
      apiKey,
      prompt,
      size
    });

    return result;
  } catch (error) {
    console.error('Error generating block display model (codegen):', error);
    throw error;
  }
}

/**
 * Generate an item texture using AI (GPT Image 1)
 */
export async function generateItemTexture(
  apiKey: string,
  description: string
): Promise<string> {
  try {
    const result = await invoke<string>('generate_item_texture', {
      apiKey,
      description
    });

    return result;
  } catch (error) {
    console.error('Error generating item texture:', error);
    throw error;
  }
}
