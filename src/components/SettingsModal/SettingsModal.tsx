import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal/Modal';
import { dbSaveSetting, dbGetSetting } from '@/utils/database';
import { getAllServerStatus, startServer, stopServer, type ServerStatus } from '@/utils/tauri-commands';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation();
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

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

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

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
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
      title={t('settings.title')}
      actions={
        <>
          <button
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
          >
            {t('settings.cancel')}
          </button>
          <button
            className="modal-btn modal-btn-success"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('settings.saving') : t('settings.save')}
          </button>
        </>
      }
    >
      <div className="settings-content">
        <div className="settings-section">
          <h3>{t('settings.apiKeys.title')}</h3>
          <p className="settings-description">
            {t('settings.apiKeys.description')}
          </p>

          <div className="settings-field">
            <label htmlFor="openai-key">
              {t('settings.apiKeys.gptKeyLabel')}
              <span className="settings-hint">{t('settings.apiKeys.gptKeyHint')}</span>
            </label>
            <div className="api-key-input-group">
              <input
                id="openai-key"
                type={showKeys ? 'text' : 'password'}
                className="settings-input"
                placeholder={t('settings.apiKeys.placeholder')}
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
              {t('settings.apiKeys.imageKeyLabel')}
              <span className="settings-hint">{t('settings.apiKeys.imageKeyHint')}</span>
            </label>
            <div className="api-key-input-group">
              <input
                id="openai-image-key"
                type={showKeys ? 'text' : 'password'}
                className="settings-input"
                placeholder={t('settings.apiKeys.placeholder')}
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
              {t('settings.apiKeys.showKeys')}
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t('settings.platform.title')}</h3>
          <p className="settings-description">
            {t('settings.platform.description')}
          </p>

          <div className="settings-field">
            <label htmlFor="edition-select">
              {t('settings.platform.editionLabel')}
              <span className="settings-hint">{t('settings.platform.editionHint')}</span>
            </label>
            <select
              id="edition-select"
              className="settings-input"
              value={edition}
              onChange={(e) => handleEditionChange(e.target.value as 'java' | 'bedrock')}
            >
              <option value="java">{t('settings.platform.editionJava')}</option>
              <option value="bedrock">{t('settings.platform.editionBedrock')}</option>
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="platform-select">
              {t('settings.platform.platformLabel')}
              <span className="settings-hint">{t('settings.platform.platformHint')}</span>
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
                  <option value="fabric">{t('settings.platform.platformFabric')}</option>
                  <option value="bukkit">{t('settings.platform.platformBukkit')}</option>
                </>
              ) : (
                <option value="bedrock">{t('settings.platform.platformBedrock')}</option>
              )}
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="version-select">
              {t('settings.platform.versionLabel')}
              <span className="settings-hint">{t('settings.platform.versionHint')}</span>
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
          <h3>{t('settings.servers.title')}</h3>
          <p className="settings-description">
            {t('settings.servers.description')}
          </p>

          {isLoadingServers ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              {t('settings.servers.loading')}
            </div>
          ) : (
            <div className="server-status-list">
              {serverStatuses.map((server) => (
                <div key={server.server_id} className="server-status-row">
                  <div className="server-info">
                    <div className="server-name">
                      {server.server_id === 'fabric' && t('settings.servers.fabricName')}
                      {server.server_id === 'bukkit' && t('settings.servers.bukkitName')}
                      {server.server_id === 'bedrock' && t('settings.servers.bedrockName')}
                    </div>
                    <div className="server-details">
                      <span className={`server-status ${server.running ? 'running' : 'stopped'}`}>
                        {server.running ? t('settings.servers.running') : t('settings.servers.stopped')}
                      </span>
                      <span className="server-port">{t('settings.servers.port')}: {server.port}</span>
                      {server.pid && <span className="server-pid">{t('settings.servers.pid')}: {server.pid}</span>}
                    </div>
                  </div>
                  <div className="server-actions">
                    {server.running ? (
                      <button
                        className="server-btn server-btn-stop"
                        onClick={() => handleStopServer(server.server_id as 'fabric' | 'bukkit' | 'bedrock')}
                      >
                        {t('settings.servers.stop')}
                      </button>
                    ) : (
                      <button
                        className="server-btn server-btn-start"
                        onClick={() => handleStartServer(server.server_id as 'fabric' | 'bukkit' | 'bedrock')}
                      >
                        {t('settings.servers.start')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>{t('settings.language.title')}</h3>
          <p className="settings-description">
            {t('settings.language.description')}
          </p>

          <div className="settings-field">
            <label htmlFor="language-select">
              {t('settings.language.label')}
              <span className="settings-hint">{t('settings.language.hint')}</span>
            </label>
            <select
              id="language-select"
              className="settings-input"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en">{t('languages.en')}</option>
              <option value="es">{t('languages.es')}</option>
              <option value="fr">{t('languages.fr')}</option>
              <option value="de">{t('languages.de')}</option>
              <option value="zh">{t('languages.zh')}</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
