import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles, faSpinner, faTrash, faCube, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { generateBlockDisplayModel, generateBlockDisplayModelCodegen } from '@/utils/tauri-commands';
import { dbGetSetting, dbSaveAiModel, dbGetAiModels, dbDeleteAiModel } from '@/utils/database';
import type { BlockDisplayModel, BlockDisplayEntity } from '@/utils/blockly-generator';
import ModelPreview from '@/components/ModelPreview/ModelPreview';
import './AIModelsPanel.css';

interface AIModelsPanelProps {
  onLoadModel?: (model: BlockDisplayModel) => void;
}

export default function AIModelsPanel({ onLoadModel }: AIModelsPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedModels, setSavedModels] = useState<BlockDisplayModel[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [useCodeGen, setUseCodeGen] = useState(true);  // Default to better quality codegen
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      const models: BlockDisplayModel[] = dbModels.map(dbModel => ({
        id: dbModel.model_id,
        name: dbModel.name,
        prompt: dbModel.prompt,
        blocks: JSON.parse(dbModel.blocks_json),
        generatedBy: dbModel.generated_by as 'ai' | 'manual',
        createdAt: dbModel.created_at
      }));
      setSavedModels(models);
    } catch (error) {
      console.error('Error loading saved models:', error);
    }
  };

  const saveModel = async (model: BlockDisplayModel) => {
    try {
      await dbSaveAiModel(
        model.id,
        model.name,
        model.prompt,
        JSON.stringify(model.blocks),
        model.generatedBy
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

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Please set your OpenAI API key in Settings first!');
      return;
    }

    if (!prompt.trim()) {
      alert('Please enter a description for your model!');
      return;
    }

    setIsGenerating(true);
    try {
      const entities: BlockDisplayEntity[] = useCodeGen
        ? await generateBlockDisplayModelCodegen(apiKey, prompt.trim(), size)
        : await generateBlockDisplayModel(apiKey, prompt.trim(), size);

      // Create model object
      const model: BlockDisplayModel = {
        id: `model_${Date.now()}`,
        name: prompt.trim(),
        prompt: prompt.trim(),
        blocks: entities,
        generatedBy: 'ai',
        createdAt: Date.now()
      };

      // Save to local storage
      saveModel(model);

      alert(`Generated "${prompt}" successfully!\n\n${entities.length} blocks created.\n\nYou can now use the "Spawn AI model" block with ID: ${model.id}`);

      // Clear prompt
      setPrompt('');
    } catch (err: any) {
      console.error('Generation error:', err);
      alert(`Error generating model: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseModel = (model: BlockDisplayModel) => {
    if (onLoadModel) {
      onLoadModel(model);
    }
    alert(`To use this model:\n\n1. Go to the "AI Models" category in the toolbox\n2. Drag out a "Spawn AI model" block\n3. Enter the model ID: ${model.id}`);
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

  return (
    <div className="ai-models-panel">
      <div className="generator-section">
        <div className="input-group">
          <label htmlFor="model-prompt">Describe your model:</label>
          <input
            id="model-prompt"
            type="text"
            className="model-prompt-input"
            placeholder="e.g., Japanese lantern"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
            disabled={isGenerating}
          />
        </div>

        <div className="input-group">
          <label htmlFor="model-size">Size:</label>
          <select
            id="model-size"
            value={size}
            onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}
            disabled={isGenerating}
            className="size-select"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
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
        <h4>Your Models ({savedModels.length})</h4>

        {savedModels.length === 0 ? (
          <p className="empty-state">
            No models yet
          </p>
        ) : (
          <div className="models-list">
            {savedModels.map(model => {
              const isExpanded = expandedPreviews.has(model.id);
              return (
                <div key={model.id} className="model-card">
                  <div className="model-card-header">
                    <h5>{model.name}</h5>
                    <button
                      className="delete-btn"
                      onClick={() => deleteModel(model.id)}
                      title="Delete model"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  <div className="model-card-body">
                    {isExpanded && (
                      <ModelPreview blocks={model.blocks} size={140} clickable={true} />
                    )}
                    <p className="model-info">
                      {model.blocks.length} blocks
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
