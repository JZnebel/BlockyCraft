import { useState, useEffect, useRef } from 'react';
import { EXAMPLE_PROJECTS } from '@/utils/startup-examples';
import {
  dbGetProjects,
  dbDeleteProject,
  dbGetMedia,
  dbSaveMedia,
  dbDeleteMedia,
  type DbProject,
  type DbMediaFile,
} from '@/utils/database';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import AIModelsPanel from '@/components/AIModelsPanel/AIModelsPanel';
import './ExamplesPanel.css';

interface ExamplesPanelProps {
  onLoadExample: (workspaceXml: string) => void;
  onLoadProject: (workspaceXml: string, projectName: string) => void;
  deploymentRefreshKey: number;
  onDeploymentChange: () => void;
}

// Use database types for projects and media
export type SavedProject = DbProject & { dataUrl?: string };
export type MediaFile = DbMediaFile & { dataUrl?: string };

export default function ExamplesPanel({ onLoadExample, onLoadProject, deploymentRefreshKey, onDeploymentChange }: ExamplesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'examples' | 'projects' | 'media' | 'ai'>('projects');
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [deployedMods, setDeployedMods] = useState<Set<string>>(new Set());
  const [expandedDifficulties, setExpandedDifficulties] = useState<Set<string>>(
    new Set(['beginner', 'intermediate', 'advanced', 'expert'])
  );
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [, setIsDraggingOver] = useState(false);
  const [aiTextureDescription, setAiTextureDescription] = useState('');
  const [isGeneratingTexture, setIsGeneratingTexture] = useState(false);
  const processingFiles = useRef<Set<string>>(new Set()); // Track files being processed
  const aiImageDropHandler = useRef<((base64: string, dataUrl: string) => void) | null>(null);
  const activeTabRef = useRef<'examples' | 'projects' | 'media' | 'ai'>('projects'); // Ref to track current tab

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Keep activeTabRef in sync with activeTab state
  useEffect(() => {
    activeTabRef.current = activeTab;
    console.log('[TAB] Active tab changed to:', activeTab);
  }, [activeTab]);

  // Load saved projects and media from database on mount
  useEffect(() => {
    loadSavedProjects();
    loadMediaFiles();

    // Set up Tauri file drop events - only once on mount
    let unlistenDrop: (() => void) | null = null;

    const setupTauriEvents = async () => {
      try {
        const { getCurrentWebview } = await import('@tauri-apps/api/webview');
        const webview = getCurrentWebview();

        console.log('[TAURI] Setting up file drop listeners...');

        // Listen for drag and drop events using the proper API
        unlistenDrop = await webview.onDragDropEvent((event) => {
          console.log('[TAURI] Drag drop event:', event);

          if (event.payload.type === 'enter' || event.payload.type === 'over') {
            console.log('[TAURI] User hovering files');
            setIsDraggingOver(true);
          } else if (event.payload.type === 'drop') {
            console.log('[TAURI] User dropped files:', event.payload.paths);
            setIsDraggingOver(false);
            handleTauriFileDrop(event.payload.paths);
          } else if (event.payload.type === 'leave') {
            console.log('[TAURI] File drop cancelled');
            setIsDraggingOver(false);
          }
        });

        console.log('[TAURI] File drop listeners set up successfully');
      } catch (error) {
        console.error('[TAURI] Error setting up file drop:', error);
      }
    };

    setupTauriEvents();

    return () => {
      if (unlistenDrop) unlistenDrop();
    };
  }, []); // Empty dependency array - only run once on mount

  // Reload projects when tab switches to projects
  useEffect(() => {
    if (activeTab === 'projects') {
      loadSavedProjects();
      loadDeployedMods();
    }
  }, [activeTab]);

  // Reload deployments when deploymentRefreshKey changes
  useEffect(() => {
    loadDeployedMods();
  }, [deploymentRefreshKey]);

  const loadDeployedMods = () => {
    try {
      const stored = localStorage.getItem('blocklycraft_deployments');
      if (stored) {
        const deployments = JSON.parse(stored);
        const deployed = new Set<string>(deployments.map((d: any) => d.projectName as string));
        setDeployedMods(deployed);
      }
    } catch (error) {
      console.error('Error loading deployments:', error);
    }
  };

  const loadSavedProjects = async () => {
    try {
      const projects = await dbGetProjects();
      setSavedProjects(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadMediaFiles = async () => {
    try {
      // Load media file metadata from database
      const mediaMetadata = await dbGetMedia();

      // Load thumbnails from app data directory
      const { appDataDir } = await import('@tauri-apps/api/path');
      const fs = await import('@tauri-apps/plugin-fs');
      const mediaDir = await appDataDir();
      const mediaDirPath = `${mediaDir}/media/`;

      // Load data URLs for each file
      const loadedMedia = await Promise.all(
        mediaMetadata.map(async (media) => {
          try {
            const filePath = `${mediaDirPath}${media.file_name}`;
            const fileData = await fs.readFile(filePath);

            // Convert to base64 using chunking to avoid stack overflow
            const uint8Array = new Uint8Array(fileData);
            let binaryString = '';
            const chunkSize = 0x8000; // 32KB chunks
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
              binaryString += String.fromCharCode(...chunk);
            }
            const base64 = btoa(binaryString);

            const ext = media.file_name.split('.').pop()?.toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' :
                            ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                            ext === 'gif' ? 'image/gif' : 'image/webp';
            return { ...media, dataUrl: `data:${mimeType};base64,${base64}` };
          } catch (err) {
            console.error('[MEDIA] Error loading file:', media.file_name, err);
            return null;
          }
        })
      );

      setMediaFiles(loadedMedia.filter(m => m !== null) as MediaFile[]);
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };


  const handleTauriFileDrop = async (filePaths: string[]) => {
    console.log('[TAURI] Processing dropped files:', filePaths);
    console.log('[TAURI] Active tab (ref):', activeTabRef.current);
    console.log('[TAURI] AI handler exists:', !!aiImageDropHandler.current);
    setIsDraggingOver(false);

    // If AI tab is active and we have an image drop handler, route images there
    if (activeTabRef.current === 'ai' && aiImageDropHandler.current && filePaths.length > 0) {
      const filePath = filePaths[0]; // Take first image only for AI tab
      const ext = filePath.split('.').pop()?.toLowerCase();
      console.log('[TAURI] Routing to AI Models - file extension:', ext);

      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
        try {
          const fs = await import('@tauri-apps/plugin-fs');
          const fileData = await fs.readFile(filePath);

          // Convert to base64
          const uint8Array = new Uint8Array(fileData);
          let binaryString = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            binaryString += String.fromCharCode(...chunk);
          }
          const base64 = btoa(binaryString);

          const mimeType = ext === 'png' ? 'image/png' :
                          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                          ext === 'gif' ? 'image/gif' : 'image/webp';
          const dataUrl = `data:${mimeType};base64,${base64}`;

          // Call AI panel's drop handler
          aiImageDropHandler.current(base64, dataUrl);
          console.log('[TAURI] Image routed to AI Models panel');
          return;
        } catch (error) {
          console.error('[TAURI] Error processing image for AI tab:', error);
        }
      }
    }

    console.log('[TAURI] Processing as media library file');
    // Otherwise, process as media library files
    try {
      const fs = await import('@tauri-apps/plugin-fs');
      const { appDataDir } = await import('@tauri-apps/api/path');
      console.log('[TAURI] Successfully imported fs plugin');

      // Ensure media directory exists
      const mediaDir = await appDataDir();
      const mediaDirPath = `${mediaDir}/media/`;

      try {
        await fs.mkdir(mediaDirPath, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      for (const filePath of filePaths) {
        // Prevent duplicate processing
        if (processingFiles.current.has(filePath)) {
          console.log('[TAURI] Already processing file, skipping:', filePath);
          continue;
        }
        processingFiles.current.add(filePath);

        try {
          console.log('[TAURI] Processing file path:', filePath);

          // Check if it's an image file
          const ext = filePath.split('.').pop()?.toLowerCase();
          console.log('[TAURI] File extension:', ext);

          if (!['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
            console.log('[TAURI] Skipping non-image file:', filePath);
            processingFiles.current.delete(filePath);
            continue;
          }

          console.log('[TAURI] Reading binary file:', filePath);
          const fileData = await fs.readFile(filePath);
          console.log('[TAURI] File data read successfully, size:', fileData.length, 'bytes');

          const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'unknown';
          const storedFileName = `${Date.now()}_${fileName}`;
          const storedFilePath = `${mediaDirPath}${storedFileName}`;

          // Write file to app data directory
          console.log('[TAURI] Saving file to:', storedFilePath);
          await fs.writeFile(storedFilePath, fileData);

          // Convert to base64 for thumbnail
          console.log('[TAURI] Converting to base64...');
          const uint8Array = new Uint8Array(fileData);
          let binaryString = '';
          const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            binaryString += String.fromCharCode(...chunk);
          }
          const base64 = btoa(binaryString);
          console.log('[TAURI] Base64 conversion complete, length:', base64.length);

          const mimeType = ext === 'png' ? 'image/png' :
                          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                          ext === 'gif' ? 'image/gif' : 'image/webp';
          const dataUrl = `data:${mimeType};base64,${base64}`;

          // Save to database
          console.log('[TAURI] Saving to database...');
          const mediaId = await dbSaveMedia(fileName, storedFileName);
          console.log('[TAURI] Saved to database with ID:', mediaId);

          const newMedia: MediaFile = {
            id: mediaId,
            name: fileName,
            file_name: storedFileName,
            dataUrl,
            created_at: Date.now()
          };

          console.log('[TAURI] Created MediaFile object:', { name: newMedia.name, file_name: newMedia.file_name, created_at: newMedia.created_at });

          setMediaFiles(prev => {
            console.log('[TAURI] Current media files count:', prev.length);
            const updated = [...prev, newMedia];
            console.log('[TAURI] New media files count:', updated.length);
            return updated;
          });

          console.log('[TAURI] File successfully added to library:', fileName);
          processingFiles.current.delete(filePath);
        } catch (error) {
          console.error('[TAURI] Error processing file:', filePath, error);
          console.error('[TAURI] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          processingFiles.current.delete(filePath);
        }
      }
    } catch (importError) {
      console.error('[TAURI] Error importing modules:', importError);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    console.log('[MEDIA] Files selected:', files.length);

    try {
      const fs = await import('@tauri-apps/plugin-fs');
      const { appDataDir } = await import('@tauri-apps/api/path');
      const mediaDir = await appDataDir();
      const mediaDirPath = `${mediaDir}/media/`;

      // Ensure media directory exists
      try {
        await fs.mkdir(mediaDirPath, { recursive: true });
      } catch {
        // Directory might already exist
      }

      for (const file of Array.from(files)) {
        console.log('[MEDIA] Processing file:', file.name);

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const storedFileName = `${Date.now()}_${file.name}`;
        const storedFilePath = `${mediaDirPath}${storedFileName}`;

        // Write file to app data directory
        await fs.writeFile(storedFilePath, uint8Array);
        console.log('[MEDIA] Saved file to:', storedFilePath);

        // Convert to base64 for display
        let binaryString = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
          binaryString += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binaryString);
        const ext = file.name.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'png' ? 'image/png' :
                        ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                        ext === 'gif' ? 'image/gif' : 'image/webp';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        // Save to database
        const mediaId = await dbSaveMedia(file.name, storedFileName);
        console.log('[MEDIA] Saved to database with ID:', mediaId);

        const newMedia: MediaFile = {
          id: mediaId,
          name: file.name,
          file_name: storedFileName,
          dataUrl,
          created_at: Date.now()
        };

        setMediaFiles(prev => [...prev, newMedia]);
        console.log('[MEDIA] File successfully added to library:', file.name);
      }
    } catch (error) {
      console.error('[MEDIA] Error processing files:', error);
    }

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const deleteMedia = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();

    const media = mediaFiles[index];

    setConfirmModal({
      isOpen: true,
      title: 'Delete Texture',
      message: `Are you sure you want to delete "${media.name}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        try {
          // Delete file from app data directory
          const fs = await import('@tauri-apps/plugin-fs');
          const { appDataDir } = await import('@tauri-apps/api/path');
          const mediaDir = await appDataDir();
          const filePath = `${mediaDir}/media/${media.file_name}`;

          await fs.remove(filePath);
          console.log('[MEDIA] Deleted file:', filePath);

          // Delete from database
          if (media.id) {
            await dbDeleteMedia(media.id);
            console.log('[MEDIA] Deleted from database, ID:', media.id);
          }

          // Only update state after successful deletion
          const updated = mediaFiles.filter((_, i) => i !== index);
          setMediaFiles(updated);
        } catch (error) {
          console.error('[MEDIA] Error deleting file:', error);
          alert(`Failed to delete texture: ${error}`);
        }
      }
    });
  };

  const generateAITexture = async () => {
    if (!aiTextureDescription.trim()) {
      alert('Please enter a description for the texture');
      return;
    }

    setIsGeneratingTexture(true);

    try {
      // Get API key from settings
      const { dbGetSetting } = await import('@/utils/database');
      const apiKey = await dbGetSetting('openai_api_key');

      if (!apiKey) {
        alert('Please set your OpenAI API key in Settings first');
        setIsGeneratingTexture(false);
        return;
      }

      // Generate texture using Tauri command
      const { generateItemTexture } = await import('@/utils/tauri-commands');
      console.log('[AI TEXTURE] Generating:', aiTextureDescription);

      const base64Image = await generateItemTexture(apiKey, aiTextureDescription);

      // Convert to data URL
      const dataUrl = `data:image/png;base64,${base64Image}`;

      // Save to media library
      const fileName = `ai_texture_${Date.now()}.png`;
      const name = aiTextureDescription.substring(0, 50); // Use description as name

      // Save file
      const fs = await import('@tauri-apps/plugin-fs');
      const { appDataDir } = await import('@tauri-apps/api/path');
      const mediaDir = await appDataDir();
      const mediaDirPath = `${mediaDir}/media`;

      // Ensure media directory exists
      try {
        await fs.mkdir(mediaDirPath, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }

      const filePath = `${mediaDirPath}/${fileName}`;

      // Decode base64 and save
      const imageData = atob(base64Image);
      const bytes = new Uint8Array(imageData.length);
      for (let i = 0; i < imageData.length; i++) {
        bytes[i] = imageData.charCodeAt(i);
      }

      await fs.writeFile(filePath, bytes);
      console.log('[AI TEXTURE] Saved file:', filePath);

      // Save to database
      const mediaId = await dbSaveMedia(name, fileName);
      console.log('[AI TEXTURE] Saved to database with ID:', mediaId);

      // Add to state
      setMediaFiles(prev => [...prev, {
        id: mediaId,
        name,
        file_name: fileName,
        dataUrl,
        created_at: Date.now()
      }]);

      // Clear input
      setAiTextureDescription('');
      alert('Texture generated successfully!');

    } catch (error) {
      console.error('[AI TEXTURE] Error:', error);
      alert(`Failed to generate texture: ${error}`);
    } finally {
      setIsGeneratingTexture(false);
    }
  };

  const deleteProject = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();

    const project = savedProjects[index];
    const isDeployed = deployedMods.has(project.name);

    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"?${isDeployed ? ' This project is currently deployed and will be undeployed.' : ''} This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        try {
          // If the project is deployed, undeploy it first
          if (isDeployed) {
            try {
              const projectId = project.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');

              // Remove from deployments
              const stored = localStorage.getItem('blocklycraft_deployments');
              if (stored) {
                const deployments = JSON.parse(stored);
                const updated = deployments.filter((d: any) => d.projectId !== projectId);
                localStorage.setItem('blocklycraft_deployments', JSON.stringify(updated));
              }

              // Call Rust backend to delete the jar files
              const { invoke } = await import('@tauri-apps/api/core');
              await invoke('undeploy_mod', { projectId });

              // Refresh deployment status
              onDeploymentChange();
            } catch (error) {
              console.error('Error undeploying during delete:', error);
              alert(`Warning: Could not fully undeploy mod: ${error}`);
            }
          }

          // Delete the project from database
          if (project.id) {
            await dbDeleteProject(project.id);
            console.log('[DB] Deleted project from database, ID:', project.id);
          }

          // Only update state after successful deletion
          const updatedProjects = savedProjects.filter((_, i) => i !== index);
          setSavedProjects(updatedProjects);
        } catch (error) {
          console.error('[DB] Error deleting project:', error);
          alert(`Failed to delete project: ${error}`);
        }
      }
    });
  };

  const undeployMod = (projectName: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setConfirmModal({
      isOpen: true,
      title: 'Undeploy Mod',
      message: `Are you sure you want to undeploy "${projectName}"? This will remove it from Minecraft.`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        try {
          const projectId = projectName.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');

          // Remove from deployments
          const stored = localStorage.getItem('blocklycraft_deployments');
          if (stored) {
            const deployments = JSON.parse(stored);
            const updated = deployments.filter((d: any) => d.projectId !== projectId);
            localStorage.setItem('blocklycraft_deployments', JSON.stringify(updated));
          }

          // Call Rust backend to delete the jar file
          const { invoke } = await import('@tauri-apps/api/core');
          await invoke('undeploy_mod', { projectId });

          // Refresh deployment status
          onDeploymentChange();

          console.log(`Successfully undeployed ${projectName}`);
        } catch (error) {
          console.error('Undeploy error:', error);
          alert(`Error undeploying mod: ${error}`);
        }
      }
    });
  };

  const handleExampleClick = (workspaceXml: string) => {
    onLoadExample(workspaceXml);
  };

  const handleProjectClick = (project: SavedProject, index: number) => {
    setActiveProjectIndex(index);
    onLoadProject(project.workspace_xml, project.name);
  };

  const toggleDifficulty = (difficulty: string) => {
    const newExpanded = new Set(expandedDifficulties);
    if (newExpanded.has(difficulty)) {
      newExpanded.delete(difficulty);
    } else {
      newExpanded.add(difficulty);
    }
    setExpandedDifficulties(newExpanded);
  };

  // Group examples by difficulty
  const groupedExamples = EXAMPLE_PROJECTS.reduce((acc, example) => {
    const difficulty = (example as any).difficulty || 'beginner';
    if (!acc[difficulty]) {
      acc[difficulty] = [];
    }
    acc[difficulty].push(example);
    return acc;
  }, {} as Record<string, typeof EXAMPLE_PROJECTS>);

  const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
  const difficultyLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert'
  };

  const difficultyColors: Record<string, string> = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#9C27B0',
    expert: '#F44336'
  };

  return (
    <>
      <div className={`examples-panel ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-header">
          <h2>{activeTab === 'examples' ? 'Examples' : activeTab === 'media' ? 'Media Library' : 'Projects'}</h2>
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Collapse"
          >
            ◀
          </button>
        </div>

      {!isCollapsed && (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projects
            </button>
            <button
              className={`tab ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              Media
            </button>
            <button
              className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Examples
            </button>
            <button
              className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Models
            </button>
          </div>

          {activeTab === 'ai' ? (
            <AIModelsPanel
              onRegisterImageDropHandler={(handler) => {
                aiImageDropHandler.current = handler;
              }}
            />
          ) : activeTab === 'media' ? (
            <div className="examples-list">
              <div className="media-upload-section">
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
                <label htmlFor="media-upload" className="media-upload-button">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">Upload Images</div>
                  <div className="upload-subtext">Click to select PNG, JPG, GIF files</div>
                </label>
              </div>

              <div className="ai-texture-section">
                <div className="ai-texture-header">
                  <div className="upload-icon">✨</div>
                  <div className="upload-text">Generate with AI</div>
                </div>
                <input
                  type="text"
                  className="ai-texture-input"
                  placeholder="Describe the texture you want (e.g., 'A glowing purple sword with lightning')"
                  value={aiTextureDescription}
                  onChange={(e) => setAiTextureDescription(e.target.value)}
                  disabled={isGeneratingTexture}
                />
                <button
                  className="ai-generate-button"
                  onClick={generateAITexture}
                  disabled={isGeneratingTexture || !aiTextureDescription.trim()}
                >
                  {isGeneratingTexture ? 'Generating...' : 'Generate Texture'}
                </button>
              </div>

              {mediaFiles.length === 0 ? (
                <div className="empty-state">
                  No textures uploaded yet. Drag and drop images above!
                </div>
              ) : (
                <div className="media-grid">
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="media-item">
                      <img src={media.dataUrl} alt={media.name} className="media-thumbnail" />
                      <div className="media-info">
                        <div className="media-name">{media.name}</div>
                        <button
                          className="delete-btn"
                          onClick={(e) => deleteMedia(index, e)}
                          title="Delete texture"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'examples' ? (
            <div className="examples-list">
              {difficultyOrder.map((difficulty) => {
                const examples = groupedExamples[difficulty] || [];
                if (examples.length === 0) return null;
                const isExpanded = expandedDifficulties.has(difficulty);

                return (
                  <div key={difficulty} className="difficulty-section">
                    <div
                      className="difficulty-header"
                      onClick={() => toggleDifficulty(difficulty)}
                      style={{ borderLeft: `4px solid ${difficultyColors[difficulty]}` }}
                    >
                      <span className="difficulty-label">
                        {difficultyLabels[difficulty]} ({examples.length})
                      </span>
                      <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
                    </div>

                    {isExpanded && (
                      <div className="difficulty-examples">
                        {examples.map((example, index) => (
                          <div
                            key={index}
                            className="example-item"
                            onClick={() => handleExampleClick(example.workspace)}
                          >
                            <div className="example-name">{example.name}</div>
                            <div className="example-description">{example.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="examples-list">
              {savedProjects.length === 0 ? (
                <div className="empty-state">
                  No saved projects yet. Create something awesome and click "Save" in the header!
                </div>
              ) : (
                savedProjects.map((project, index) => (
                  <div
                    key={index}
                    className={`project-item ${activeProjectIndex === index ? 'active' : ''} ${deployedMods.has(project.name) ? 'deployed' : ''}`}
                  >
                    <div
                      className="project-info"
                      onClick={() => handleProjectClick(project, index)}
                    >
                      <div className="example-name">{project.name}</div>
                      <div className="example-description">
                        {new Date(project.updated_at * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="project-actions">
                      {deployedMods.has(project.name) && (
                        <span className="deploy-badge">🎮 Deployed</span>
                      )}
                      <div className="button-row">
                        {deployedMods.has(project.name) && (
                          <button
                            className="undeploy-btn"
                            onClick={(e) => undeployMod(project.name, e)}
                            title="Undeploy mod"
                          >
                            🗑️
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={(e) => deleteProject(index, e)}
                          title="Delete project"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      </div>

      {isCollapsed && (
        <button
          className="expand-btn"
          onClick={() => setIsCollapsed(false)}
          title="Expand"
        >
          ▶
        </button>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
