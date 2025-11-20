import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import { dbSaveSetting, dbGetSetting } from '@/utils/database';
import { getAllServerStatus, startServer, stopServer, type ServerStatus } from '@/utils/tauri-commands';
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

  // Platform settings
  const [edition, setEdition] = useState<'java' | 'bedrock'>('java');
  const [platform, setPlatform] = useState<'fabric' | 'bukkit' | 'bedrock'>('fabric');
  const [minecraftVersion, setMinecraftVersion] = useState('1.21.1');

  // Server management
  const [serverStatuses, setServerStatuses] = useState<ServerStatus[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(false);

  // Load existing API keys when modal opens
  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
      loadServerStatus();
    }
  }, [isOpen]);

  const loadApiKeys = async () => {
    try {
      const key1 = await dbGetSetting('openai_api_key');
      const key2 = await dbGetSetting('openai_image_api_key');
      const platformSetting = await dbGetSetting('platform');
      const editionSetting = await dbGetSetting('edition');
      const versionSetting = await dbGetSetting('minecraft_version');

      if (key1) setOpenaiKey(key1);
      if (key2) setOpenaiImageKey(key2);
      if (platformSetting) setPlatform(platformSetting as 'fabric' | 'bukkit' | 'bedrock');
      if (editionSetting) setEdition(editionSetting as 'java' | 'bedrock');
      if (versionSetting) setMinecraftVersion(versionSetting);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadServerStatus = async () => {
    setIsLoadingServers(true);
    try {
      const statuses = await getAllServerStatus();
      setServerStatuses(statuses);
    } catch (error) {
      console.error('Error loading server status:', error);
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleStartServer = async (serverId: 'fabric' | 'bukkit' | 'bedrock') => {
    try {
      await startServer(serverId);
      // Reload server status after starting
      await loadServerStatus();
    } catch (error) {
      console.error(`Error starting ${serverId} server:`, error);
      alert(`Error starting ${serverId} server: ${error}`);
    }
  };

  const handleStopServer = async (serverId: 'fabric' | 'bukkit' | 'bedrock') => {
    try {
      await stopServer(serverId);
      // Reload server status after stopping
      await loadServerStatus();
    } catch (error) {
      console.error(`Error stopping ${serverId} server:`, error);
      alert(`Error stopping ${serverId} server: ${error}`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save API keys
      if (openaiKey.trim()) {
        await dbSaveSetting('openai_api_key', openaiKey.trim());
      }
      if (openaiImageKey.trim()) {
        await dbSaveSetting('openai_image_api_key', openaiImageKey.trim());
      }

      // Save platform settings
      await dbSaveSetting('platform', platform);
      await dbSaveSetting('edition', edition);
      await dbSaveSetting('minecraft_version', minecraftVersion);

      alert('Settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edition change - automatically update platform
  const handleEditionChange = (newEdition: 'java' | 'bedrock') => {
    setEdition(newEdition);
    if (newEdition === 'bedrock') {
      setPlatform('bedrock');
    } else {
      // Default to Fabric for Java
      setPlatform('fabric');
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

        <div className="settings-section">
          <h3>Platform Settings</h3>
          <p className="settings-description">
            Configure the Minecraft platform and version you're developing for. This determines which blocks are available and how code is generated.
          </p>

          <div className="settings-field">
            <label htmlFor="edition-select">
              Edition
              <span className="settings-hint">(Java or Bedrock)</span>
            </label>
            <select
              id="edition-select"
              className="settings-input"
              value={edition}
              onChange={(e) => handleEditionChange(e.target.value as 'java' | 'bedrock')}
            >
              <option value="java">Java Edition</option>
              <option value="bedrock">Bedrock Edition</option>
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="platform-select">
              Platform
              <span className="settings-hint">(mod loader or server type)</span>
            </label>
            <select
              id="platform-select"
              className="settings-input"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as 'fabric' | 'bukkit' | 'bedrock')}
              disabled={edition === 'bedrock'}
            >
              {edition === 'java' ? (
                <>
                  <option value="fabric">Fabric (Mods)</option>
                  <option value="bukkit">Bukkit/Paper (Plugins)</option>
                </>
              ) : (
                <option value="bedrock">Bedrock (Add-ons)</option>
              )}
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="version-select">
              Minecraft Version
              <span className="settings-hint">(currently only 1.21.1 supported)</span>
            </label>
            <select
              id="version-select"
              className="settings-input"
              value={minecraftVersion}
              onChange={(e) => setMinecraftVersion(e.target.value)}
            >
              <option value="1.21.1">1.21.1</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Deployment Servers</h3>
          <p className="settings-description">
            Manage which deployment servers are running. These servers are used to deploy your mods to Minecraft.
          </p>

          {isLoadingServers ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              Loading server status...
            </div>
          ) : (
            <div className="server-status-list">
              {serverStatuses.map((server) => (
                <div key={server.server_id} className="server-status-row">
                  <div className="server-info">
                    <div className="server-name">
                      {server.server_id === 'fabric' && '🟦 Fabric (Java)'}
                      {server.server_id === 'bukkit' && '🟨 Bukkit (Java)'}
                      {server.server_id === 'bedrock' && '🟩 Bedrock'}
                    </div>
                    <div className="server-details">
                      <span className={`server-status ${server.running ? 'running' : 'stopped'}`}>
                        {server.running ? '🟢 Running' : '⚪ Stopped'}
                      </span>
                      <span className="server-port">Port: {server.port}</span>
                      {server.pid && <span className="server-pid">PID: {server.pid}</span>}
                    </div>
                  </div>
                  <div className="server-actions">
                    {server.running ? (
                      <button
                        className="server-btn server-btn-stop"
                        onClick={() => handleStopServer(server.server_id as 'fabric' | 'bukkit' | 'bedrock')}
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        className="server-btn server-btn-start"
                        onClick={() => handleStartServer(server.server_id as 'fabric' | 'bukkit' | 'bedrock')}
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
