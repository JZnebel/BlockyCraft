import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCube, faCopy } from '@fortawesome/free-solid-svg-icons';
import type { BlockDisplayModel } from '@/utils/blockly-generator';
import ModelPreview from '@/components/ModelPreview/ModelPreview';
import './ModelCard.css';

interface ModelCardProps {
  model: BlockDisplayModel;
  onDelete: (modelId: string) => void;
  onCopyId: (id: string) => void;
}

export default function ModelCard({ model, onDelete, onCopyId }: ModelCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="model-card">
      <div className="model-card-header">
        <h5>{model.name}</h5>
        <button
          className="delete-btn"
          onClick={() => onDelete(model.id)}
          title="Delete model"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      <div className="model-card-body">
        {showPreview ? (
          <ModelPreview blocks={model.blocks} size={140} clickable={true} />
        ) : (
          <button
            onClick={() => setShowPreview(true)}
            className="show-preview-btn"
            title="Click to show preview"
          >
            <FontAwesomeIcon icon={faCube} size="2x" />
            <span>Show Preview</span>
          </button>
        )}
        <p className="model-info">
          {model.blocks.length} blocks
        </p>
        <p className="model-id">
          <code>{model.id}</code>
          <button
            className="copy-btn"
            onClick={() => onCopyId(model.id)}
            title="Copy model ID"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </p>
      </div>
    </div>
  );
}
