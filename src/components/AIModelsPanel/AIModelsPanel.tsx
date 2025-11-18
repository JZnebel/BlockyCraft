import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles, faSpinner, faTrash, faCopy, faCheck, faChevronLeft, faChevronRight, faImage, faXmark, faEdit } from '@fortawesome/free-solid-svg-icons';
import { generateBlockDisplayModelCodegen, editBlockDisplayModel } from '@/utils/tauri-commands';
import { dbGetSetting, dbSaveAiModel, dbGetAiModels, dbGetAiModelBlocks, dbDeleteAiModel } from '@/utils/database';
import type { BlockDisplayModel, BlockDisplayEntity } from '@/utils/database';
import ModelPreview from '@/components/ModelPreview/ModelPreviewThree';
import './AIModelsPanel.css';

interface AIModelsPanelProps {
  onLoadModel?: (model: BlockDisplayModel) => void;
  onRegisterImageDropHandler?: (handler: (base64: string, dataUrl: string) => void) => void;
}

interface ModelMetadata {
  id: string;
  name: string;
  prompt: string;
  blockCount: number;
  generatedBy: 'ai' | 'manual';
  createdAt: number;
  generatedCode?: string; // Python code that generated the model
}

const MODELS_PER_PAGE = 6;

export default function AIModelsPanel(props: AIModelsPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedModels, setSavedModels] = useState<ModelMetadata[]>([]);
  const [loadedBlocks, setLoadedBlocks] = useState<Map<string, BlockDisplayEntity[]>>(new Map());
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Base64 image
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For preview
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  // Handle image drop from parent
  const handleImageDrop = (base64: string, dataUrl: string) => {
    setSelectedImage(base64);
    setImagePreview(dataUrl);
  };

  // Register drop handler with parent
  useEffect(() => {
    console.log('[AI Models] Registering image drop handler, callback exists:', !!props.onRegisterImageDropHandler);
    if (props.onRegisterImageDropHandler) {
      props.onRegisterImageDropHandler(handleImageDrop);
      console.log('[AI Models] Image drop handler registered successfully');
    }
  }, [props.onRegisterImageDropHandler]);

  // Load API key on mount
  useEffect(() => {
    loadApiKey();
    loadSavedModels();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await dbGetSetting('openai_api_key');
      setApiKey(key);
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadSavedModels = async () => {
    try {
      const dbModels = await dbGetAiModels();
      // Store metadata only, blocks are fetched on-demand
      const models: ModelMetadata[] = dbModels.map(dbModel => ({
        id: dbModel.model_id,
        name: dbModel.name,
        prompt: dbModel.prompt,
        blockCount: dbModel.block_count,
        generatedBy: dbModel.generated_by as 'ai' | 'manual',
        createdAt: dbModel.created_at,
        generatedCode: dbModel.generated_code
      }));
      setSavedModels(models);
    } catch (error) {
      console.error('Error loading saved models:', error);
    }
  };

  // Lazy-load blocks for a specific model from database
  const getModelBlocks = (modelId: string): BlockDisplayEntity[] => {
    // Check if already loaded in cache
    if (loadedBlocks.has(modelId)) {
      return loadedBlocks.get(modelId)!;
    }

    // Fetch from database asynchronously
    dbGetAiModelBlocks(modelId)
      .then(blocksJson => {
        try {
          const blocks = JSON.parse(blocksJson);
          // Cache parsed blocks
          setLoadedBlocks(prev => new Map(prev).set(modelId, blocks));
        } catch (error) {
          console.error('Error parsing blocks for model:', modelId, error);
        }
      })
      .catch(error => {
        console.error('Error loading blocks for model:', modelId, error);
      });

    // Return empty array while loading (will re-render when blocks are loaded)
    return [];
  };

  const saveModel = async (model: BlockDisplayModel) => {
    try {
      await dbSaveAiModel(
        model.id,
        model.name,
        model.prompt,
        JSON.stringify(model.blocks || []),
        model.generatedBy,
        undefined,
        (model.blocks || []).length // Pass the block count
      );
      // Reload models from database
      await loadSavedModels();
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const deleteModel = async (modelId: string) => {
    try {
      // Find the database ID for this model
      const dbModels = await dbGetAiModels();
      const dbModel = dbModels.find(m => m.model_id === modelId);
      if (dbModel && dbModel.id) {
        await dbDeleteAiModel(dbModel.id);
        // Reload models from database
        await loadSavedModels();
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64 = result.split(',')[1];
      setSelectedImage(base64);
      setImagePreview(result); // Keep full data URL for preview
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Please set your OpenAI API key in Settings first!');
      return;
    }

    if (!prompt.trim() && !selectedImage) {
      alert('Please enter a description or upload an image!');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate with optional image
      const result = await generateBlockDisplayModelCodegen(
        apiKey,
        prompt.trim(),
        size,
        selectedImage || undefined
      );

      // Create model name
      const modelName = prompt.trim() || 'Image Model';

      // Create model object
      const model: BlockDisplayModel = {
        id: `model_${Date.now()}`,
        name: modelName,
        prompt: modelName,
        blocks: result.blocks,
        generatedBy: 'ai',
        createdAt: Date.now()
      };

      // Save to database with generated code and block count
      await dbSaveAiModel(
        model.id,
        model.name,
        model.prompt,
        JSON.stringify(result.blocks),
        model.generatedBy,
        result.generated_code,
        result.blocks.length // Pass the block count
      );

      // Reload models from database
      await loadSavedModels();

      alert(`Generated "${modelName}" successfully!\n\n${result.blocks.length} blocks created.\n\nYou can now use the "Spawn AI model" block with ID: ${model.id}`);

      // Clear inputs
      setPrompt('');
      clearImage();
    } catch (err: any) {
      console.error('Generation error:', err);
      alert(`Error generating model: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditModel = async (modelId: string) => {
    if (!apiKey) {
      alert('Please set your OpenAI API key in Settings first!');
      return;
    }

    if (!editPrompt.trim()) {
      alert('Please enter what you want to change!');
      return;
    }

    const model = savedModels.find(m => m.id === modelId);
    if (!model || !model.generatedCode) {
      alert('Cannot edit this model - missing generation code');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await editBlockDisplayModel(
        apiKey,
        model.prompt,
        model.generatedCode,
        editPrompt.trim()
      );

      // Update model in database
      await dbSaveAiModel(
        model.id,
        model.name,
        model.prompt,
        JSON.stringify(result.blocks),
        model.generatedBy,
        result.generated_code,
        result.blocks.length
      );

      // Clear loaded blocks cache for this model
      setLoadedBlocks(prev => {
        const newMap = new Map(prev);
        newMap.delete(modelId);
        return newMap;
      });

      // Reload models from database
      await loadSavedModels();

      alert(`Edited "${model.name}" successfully!\n\n${result.blocks.length} blocks in updated model.`);

      // Clear edit state
      setEditingModelId(null);
      setEditPrompt('');
    } catch (err: any) {
      console.error('Edit error:', err);
      alert(`Error editing model: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePreview = (modelId: string) => {
    setExpandedPreviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const copyModelId = async (modelId: string) => {
    try {
      await navigator.clipboard.writeText(modelId);
      setCopiedId(modelId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(savedModels.length / MODELS_PER_PAGE);
  const paginatedModels = useMemo(() => {
    const startIdx = currentPage * MODELS_PER_PAGE;
    return savedModels.slice(startIdx, startIdx + MODELS_PER_PAGE);
  }, [savedModels, currentPage]);

  // Reset to first page when models change
  useEffect(() => {
    setCurrentPage(0);
  }, [savedModels.length]);

  return (
    <div className="ai-models-panel">
      <div className="generator-section">
        <div className="input-group">
          <label htmlFor="model-prompt">Describe your model{selectedImage ? ' (optional)' : ''}:</label>
          <input
            id="model-prompt"
            type="text"
            className="model-prompt-input"
            placeholder={selectedImage ? "Add extra details (optional)" : "e.g., Japanese lantern"}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
            disabled={isGenerating}
          />
        </div>

        {/* Image Upload Section */}
        <div className="input-group">
          <label>Or upload/drag an image:</label>
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button
                className="remove-image-btn"
                onClick={clearImage}
                disabled={isGenerating}
                title="Remove image"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : (
            <div className="image-drop-zone">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isGenerating}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="image-drop-zone-label">
                <div className="upload-icon">
                  <FontAwesomeIcon icon={faImage} size="2x" />
                </div>
                <div className="upload-text">Drop image here or click to select</div>
                <div className="upload-subtext">PNG, JPG, GIF files supported</div>
              </label>
            </div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="model-size">Detail Level:</label>
          <select
            id="model-size"
            value={size}
            onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}
            disabled={isGenerating}
            className="size-select"
          >
            <option value="small">Simple (fast, fewer blocks)</option>
            <option value="medium">Moderate (balanced)</option>
            <option value="large">Detailed (complex, more blocks)</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !apiKey}
          className="generate-btn"
        >
          {isGenerating ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Generating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              Generate
            </>
          )}
        </button>

        {!apiKey && (
          <p className="warning-text">
            ⚠️ Add API key in Settings
          </p>
        )}
      </div>

      <div className="models-list-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0 }}>Your Models ({savedModels.length})</h4>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                title="Previous page"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span style={{ fontSize: '0.875rem', color: '#606A78' }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                title="Next page"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>

        {savedModels.length === 0 ? (
          <p className="empty-state">
            No models yet
          </p>
        ) : (
          <div className="models-list">
            {paginatedModels.map(model => {
              const isExpanded = expandedPreviews.has(model.id);
              const blocks = isExpanded ? getModelBlocks(model.id) : [];

              return (
                <div key={model.id} className="model-card">
                  <div className="model-card-header">
                    <h5>{model.name}</h5>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {model.generatedCode && (
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingModelId(model.id);
                            setEditPrompt('');
                          }}
                          title="Edit model with AI"
                          disabled={isGenerating}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => deleteModel(model.id)}
                        title="Delete model"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <div className="model-card-body">
                    {isExpanded && (
                      <ModelPreview blocks={blocks} size={140} clickable={true} />
                    )}

                    {editingModelId === model.id ? (
                      <div className="edit-section">
                        <input
                          type="text"
                          className="edit-prompt-input"
                          placeholder="e.g., make it taller, change colors to red"
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleEditModel(model.id)}
                          disabled={isGenerating}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            className="edit-submit-btn"
                            onClick={() => handleEditModel(model.id)}
                            disabled={isGenerating || !editPrompt.trim()}
                          >
                            {isGenerating ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Editing...
                              </>
                            ) : (
                              'Apply Edit'
                            )}
                          </button>
                          <button
                            className="edit-cancel-btn"
                            onClick={() => {
                              setEditingModelId(null);
                              setEditPrompt('');
                            }}
                            disabled={isGenerating}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="model-info">
                          {model.blockCount} blocks
                        </p>
                        <div className="model-id-container">
                          <p className="model-id"><code>{model.id}</code></p>
                          <button
                            className="copy-id-btn"
                            onClick={() => copyModelId(model.id)}
                            title="Copy model ID"
                          >
                            <FontAwesomeIcon icon={copiedId === model.id ? faCheck : faCopy} />
                            {copiedId === model.id ? ' Copied!' : ''}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="model-card-actions">
                    <button
                      className="preview-toggle-btn"
                      onClick={() => togglePreview(model.id)}
                    >
                      {isExpanded ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
