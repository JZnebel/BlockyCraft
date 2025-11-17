import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import { dbSaveSetting, dbGetSetting } from '@/utils/database';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiImageKey, setOpenaiImageKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  // Load existing API keys when modal opens
  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
    }
  }, [isOpen]);

  const loadApiKeys = async () => {
    try {
      const key1 = await dbGetSetting('openai_api_key');
      const key2 = await dbGetSetting('openai_image_api_key');

      if (key1) setOpenaiKey(key1);
      if (key2) setOpenaiImageKey(key2);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save both keys
      if (openaiKey.trim()) {
        await dbSaveSetting('openai_api_key', openaiKey.trim());
      }
      if (openaiImageKey.trim()) {
        await dbSaveSetting('openai_image_api_key', openaiImageKey.trim());
      }

      alert('Settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return key.substring(0, 7) + '...' + key.substring(key.length - 4);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      actions={
        <>
          <button
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-success"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </>
      }
    >
      <div className="settings-content">
        <div className="settings-section">
          <h3>OpenAI API Keys</h3>
          <p className="settings-description">
            Enter your OpenAI API keys to enable AI features like block display generation and custom item textures.
          </p>

          <div className="settings-field">
            <label htmlFor="openai-key">
              GPT-5.1 API Key
              <span className="settings-hint">(for AI block display models)</span>
            </label>
            <div className="api-key-input-group">
              <input
                id="openai-key"
                type={showKeys ? 'text' : 'password'}
                className="settings-input"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>
            {openaiKey && !showKeys && (
              <div className="key-preview">{maskKey(openaiKey)}</div>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="openai-image-key">
              GPT Image 1 API Key
              <span className="settings-hint">(for custom item textures)</span>
            </label>
            <div className="api-key-input-group">
              <input
                id="openai-image-key"
                type={showKeys ? 'text' : 'password'}
                className="settings-input"
                placeholder="sk-proj-..."
                value={openaiImageKey}
                onChange={(e) => setOpenaiImageKey(e.target.value)}
              />
            </div>
            {openaiImageKey && !showKeys && (
              <div className="key-preview">{maskKey(openaiImageKey)}</div>
            )}
          </div>

          <div className="settings-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showKeys}
                onChange={(e) => setShowKeys(e.target.checked)}
              />
              Show API keys
            </label>
          </div>

        </div>
      </div>
    </Modal>
  );
}
