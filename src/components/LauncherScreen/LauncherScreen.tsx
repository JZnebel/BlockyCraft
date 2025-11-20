import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LauncherScreen.css';

interface ServerConfig {
  id: 'fabric' | 'bukkit' | 'bedrock';
  name: string;
  port: number;
  description: string;
  color: string;
}

const SERVERS: ServerConfig[] = [
  {
    id: 'fabric',
    name: 'Fabric Server',
    port: 8585,
    description: 'For Java Edition mods',
    color: '#8B5CF6',
  },
  {
    id: 'bukkit',
    name: 'Bukkit Server',
    port: 8586,
    description: 'For Java Edition plugins',
    color: '#F59E0B',
  },
  {
    id: 'bedrock',
    name: 'Bedrock Server',
    port: 8587,
    description: 'For Mobile/Console add-ons',
    color: '#10B981',
  },
];

interface LauncherScreenProps {
  onLaunch: (selectedServers: string[], rememberChoice: boolean) => void;
}

export default function LauncherScreen({ onLaunch }: LauncherScreenProps) {
  const { t } = useTranslation();
  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [localMode, setLocalMode] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Try to load from database
      const { dbGetSetting } = await import('@/utils/database');
      const savedServers = await dbGetSetting('launcher_servers');
      const savedLocalMode = await dbGetSetting('launcher_local_mode');
      const savedRemember = await dbGetSetting('launcher_remember');

      if (savedRemember === 'true') {
        if (savedLocalMode === 'true') {
          setLocalMode(true);
        } else if (savedServers) {
          const servers = JSON.parse(savedServers);
          setSelectedServers(new Set(servers));
        }
      }
    } catch (error) {
      console.log('No saved launcher preferences, using defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServer = (serverId: string) => {
    if (localMode) return;

    const newSelected = new Set(selectedServers);
    if (newSelected.has(serverId)) {
      newSelected.delete(serverId);
    } else {
      newSelected.add(serverId);
    }
    setSelectedServers(newSelected);
  };

  const toggleLocalMode = () => {
    setLocalMode(!localMode);
    if (!localMode) {
      setSelectedServers(new Set());
    }
  };

  const handleLaunch = () => {
    const serversToStart = localMode ? [] : Array.from(selectedServers);
    onLaunch(serversToStart, rememberChoice);
  };

  const canLaunch = localMode || selectedServers.size > 0;

  if (isLoading) {
    return (
      <div className="launcher-screen">
        <div className="launcher-loading">
          <div className="spinner"></div>
          <p>{t('launcher.loading')}</p>
        </div>
      </div>
    );
  }

  // Get translations for server configs
  const serverConfigs: ServerConfig[] = [
    {
      id: 'fabric',
      name: t('launcher.fabricTitle'),
      port: 8585,
      description: t('launcher.fabricDescription'),
      color: '#8B5CF6',
    },
    {
      id: 'bukkit',
      name: t('launcher.bukkitTitle'),
      port: 8586,
      description: t('launcher.bukkitDescription'),
      color: '#F59E0B',
    },
    {
      id: 'bedrock',
      name: t('launcher.bedrockTitle'),
      port: 8587,
      description: t('launcher.bedrockDescription'),
      color: '#10B981',
    },
  ];

  return (
    <div className="launcher-screen">
      <div className="launcher-container">
        <div className="launcher-header">
          <img src="/logo.png" alt="BlocklyCraft" className="launcher-logo" />
          <h1>{t('launcher.title')}</h1>
          <p className="launcher-subtitle">{t('launcher.subtitle')}</p>
        </div>

        <div className="launcher-options">
          {/* Server Options */}
          {serverConfigs.map((server) => (
            <div
              key={server.id}
              className={`launcher-option ${
                selectedServers.has(server.id) ? 'selected' : ''
              } ${localMode ? 'disabled' : ''}`}
              onClick={() => toggleServer(server.id)}
              style={{
                borderColor: selectedServers.has(server.id) ? server.color : '#374151',
              }}
            >
              <div className="option-checkbox">
                <input
                  type="checkbox"
                  checked={selectedServers.has(server.id)}
                  onChange={() => toggleServer(server.id)}
                  disabled={localMode}
                  style={{
                    accentColor: server.color,
                  }}
                />
              </div>
              <div className="option-content">
                <div className="option-header">
                  <h3>{server.name}</h3>
                  <span className="option-port">Port {server.port}</span>
                </div>
                <p className="option-description">{server.description}</p>
              </div>
            </div>
          ))}

          {/* Local Mode Option */}
          <div
            className={`launcher-option ${localMode ? 'selected' : ''}`}
            onClick={toggleLocalMode}
            style={{
              borderColor: localMode ? '#6366F1' : '#374151',
            }}
          >
            <div className="option-checkbox">
              <input
                type="checkbox"
                checked={localMode}
                onChange={toggleLocalMode}
                style={{ accentColor: '#6366F1' }}
              />
            </div>
            <div className="option-content">
              <div className="option-header">
                <h3>{t('launcher.localMode')}</h3>
                <span className="option-badge">No Servers</span>
              </div>
              <p className="option-description">
                {t('launcher.localModeDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Remember Choice */}
        <div className="launcher-remember">
          <label>
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
            />
            <span>{t('launcher.rememberChoice')}</span>
          </label>
        </div>

        {/* Launch Button */}
        <button
          className="launcher-button"
          onClick={handleLaunch}
          disabled={!canLaunch}
        >
          {t('launcher.continueButton')}
        </button>

        {!canLaunch && (
          <p className="launcher-warning">
            {t('launcher.selectServerWarning')}
          </p>
        )}
      </div>
    </div>
  );
}
