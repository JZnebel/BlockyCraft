import * as Blockly from 'blockly';
import { invoke } from '@tauri-apps/api/core';

// Media file interface matching database structure
interface MediaFile {
  id: number;
  name: string;
  file_name: string;
  created_at: number;
}

// Cached media list
let cachedMediaFiles: MediaFile[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Fetch media files from database
 */
export async function fetchMediaFiles(): Promise<MediaFile[]> {
  const now = Date.now();

  // Return cached data if recent
  if (cachedMediaFiles.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedMediaFiles;
  }

  try {
    const media = await invoke<MediaFile[]>('db_get_media');
    cachedMediaFiles = media;
    lastFetchTime = now;
    return media;
  } catch (error) {
    console.error('Failed to fetch media files:', error);
    return [];
  }
}

/**
 * Clear the media cache (call this when media is added/deleted)
 */
export function clearMediaCache(): void {
  cachedMediaFiles = [];
  lastFetchTime = 0;
}

/**
 * Convert media files to Blockly dropdown options
 */
export function mediaFilesToDropdownOptions(mediaFiles: MediaFile[]): [string, string][] {
  if (mediaFiles.length === 0) {
    return [['(No media uploaded)', 'none']];
  }

  return mediaFiles.map(media => [
    media.name || media.file_name,
    media.file_name
  ]);
}

/**
 * Create a dynamic media dropdown field
 * This dropdown will be populated with media files from the database
 */
export function createMediaDropdown(): Blockly.FieldDropdown {
  // Start with default option
  const initialOptions: [string, string][] = [['(No media uploaded)', 'none']];

  const dropdown = new Blockly.FieldDropdown(initialOptions);

  // Fetch media files and update dropdown asynchronously
  fetchMediaFiles().then(mediaFiles => {
    const options = mediaFilesToDropdownOptions(mediaFiles);

    // Update the dropdown options using getOptions method
    // @ts-ignore - accessing internal method for dynamic updates
    dropdown.menuGenerator_ = options;

    // If dropdown has a value set and it's in the options, keep it
    const currentValue = dropdown.getValue();
    const valueExists = options.some(opt => opt[1] === currentValue);

    if (!valueExists && options.length > 0) {
      dropdown.setValue(options[0][1]);
    }
  });

  return dropdown;
}

/**
 * Refresh all media dropdowns in the workspace
 * Call this after adding/deleting media files
 */
export async function refreshMediaDropdowns(workspace: Blockly.WorkspaceSvg): Promise<void> {
  clearMediaCache();
  const mediaFiles = await fetchMediaFiles();
  const options = mediaFilesToDropdownOptions(mediaFiles);

  // Find all blocks with MEDIA_TEXTURE field
  const allBlocks = workspace.getAllBlocks(false);

  for (const block of allBlocks) {
    const field = block.getField('MEDIA_TEXTURE');
    if (field && field instanceof Blockly.FieldDropdown) {
      const currentValue = field.getValue();

      // Update options using internal property
      // @ts-ignore - accessing internal method for dynamic updates
      field.menuGenerator_ = options;

      // Restore value if it still exists, otherwise set to first option
      const valueExists = options.some(opt => opt[1] === currentValue);
      if (!valueExists && options.length > 0) {
        field.setValue(options[0][1]);
      }
    }
  }
}
