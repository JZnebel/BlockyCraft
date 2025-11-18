import { invoke } from '@tauri-apps/api/core';

// TypeScript interfaces matching Rust structs
export interface DbProject {
  id?: number;
  name: string;
  workspace_xml: string;
  created_at: number;
  updated_at: number;
}

export interface DbMediaFile {
  id?: number;
  name: string;
  file_name: string;
  created_at: number;
}

export interface DbSetting {
  key: string;
  value: string;
}

// Project operations
export const dbSaveProject = async (name: string, workspaceXml: string): Promise<number> => {
  return await invoke('db_save_project', { name, workspaceXml });
};

export const dbGetProjects = async (): Promise<DbProject[]> => {
  return await invoke('db_get_projects');
};

export const dbDeleteProject = async (projectId: number): Promise<void> => {
  return await invoke('db_delete_project', { projectId });
};

// Media operations
export const dbSaveMedia = async (name: string, fileName: string): Promise<number> => {
  return await invoke('db_save_media', { name, fileName });
};

export const dbGetMedia = async (): Promise<DbMediaFile[]> => {
  return await invoke('db_get_media');
};

export const dbDeleteMedia = async (mediaId: number): Promise<void> => {
  return await invoke('db_delete_media', { mediaId });
};

// Settings operations
export const dbSaveSetting = async (key: string, value: string): Promise<void> => {
  return await invoke('db_save_setting', { key, value });
};

export const dbGetSetting = async (key: string): Promise<string | null> => {
  return await invoke('db_get_setting', { key });
};

export const dbGetAllSettings = async (): Promise<DbSetting[]> => {
  return await invoke('db_get_all_settings');
};

// Block Display Entity (matches Rust struct)
export interface BlockDisplayEntity {
  block: string;
  properties?: { [key: string]: string };
  x: number;
  y: number;
  z: number;
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

// AI Model operations
export interface DbAiModel {
  id?: number;
  model_id: string; // User-facing ID like "model_1763346432518"
  name: string;
  prompt: string;
  blocks_json: string; // JSON string of BlockDisplayEntity[]
  generated_by: string; // 'ai' | 'manual'
  created_at: number;
  generated_code?: string; // Python code that generated the model
  block_count: number; // Pre-calculated block count for performance
}

// Helper type for models with parsed blocks (frontend-friendly camelCase)
export interface BlockDisplayModel {
  id: string; // model_id from database
  name: string;
  prompt: string;
  blocks?: BlockDisplayEntity[]; // Parsed from blocks_json
  generatedBy: 'ai' | 'manual';
  createdAt: number;
}

export const dbSaveAiModel = async (modelId: string, name: string, prompt: string, blocksJson: string, generatedBy: string, generatedCode?: string, blockCount?: number): Promise<number> => {
  return await invoke('db_save_ai_model', { modelId, name, prompt, blocksJson, generatedBy, generatedCode: generatedCode || null, blockCount: blockCount || 0 });
};

export const dbGetAiModels = async (): Promise<DbAiModel[]> => {
  return await invoke('db_get_ai_models');
};

export const dbGetAiModelBlocks = async (modelId: string): Promise<string> => {
  return await invoke('db_get_ai_model_blocks', { modelId });
};

export const dbDeleteAiModel = async (id: number): Promise<void> => {
  return await invoke('db_delete_ai_model', { id });
};

// Migration helpers
export const migrateFromLocalStorage = async () => {
  console.log('[DB] Starting migration from localStorage to SQLite...');

  // Migrate projects
  try {
    const projectsJson = localStorage.getItem('blocklycraft_projects');
    if (projectsJson) {
      const projects = JSON.parse(projectsJson);
      console.log(`[DB] Migrating ${projects.length} projects...`);

      for (const project of projects) {
        await dbSaveProject(project.name, project.workspace);
      }

      console.log(`[DB] Successfully migrated ${projects.length} projects`);
    }
  } catch (error) {
    console.error('[DB] Error migrating projects:', error);
  }

  // Migrate media
  try {
    const mediaJson = localStorage.getItem('blocklycraft_media');
    if (mediaJson) {
      const media = JSON.parse(mediaJson);
      console.log(`[DB] Migrating ${media.length} media files...`);

      for (const file of media) {
        await dbSaveMedia(file.name, file.fileName);
      }

      console.log(`[DB] Successfully migrated ${media.length} media files`);
    }
  } catch (error) {
    console.error('[DB] Error migrating media:', error);
  }

  // Migrate settings
  try {
    const settings = [
      { key: 'openai_api_key', value: localStorage.getItem('openai_api_key') },
      { key: 'ai_model', value: localStorage.getItem('ai_model') },
      { key: 'has_opened', value: localStorage.getItem('blocklycraft_has_opened') },
    ];

    for (const setting of settings) {
      if (setting.value) {
        await dbSaveSetting(setting.key, setting.value);
      }
    }

    console.log('[DB] Successfully migrated settings');
  } catch (error) {
    console.error('[DB] Error migrating settings:', error);
  }

  console.log('[DB] Migration complete!');
};
