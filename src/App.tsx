import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header/Header';
import BlocklyEditor from '@/components/BlocklyEditor/BlocklyEditor';
import ExamplesPanel from '@/components/ExamplesPanel/ExamplesPanel';
import SettingsModal from '@/components/SettingsModal/SettingsModal';
import LauncherScreen from '@/components/LauncherScreen/LauncherScreen';
import Modal from '@/components/Modal/Modal';
import type * as Blockly from 'blockly';
import {
  generateModData,
  serializeWorkspace,
  loadWorkspace,
  validateModData,
} from '@/utils/blockly-generator';
import { dbSaveProject, dbGetSetting, dbSaveSetting } from '@/utils/database';
import { startServer } from '@/utils/tauri-commands';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState('Untitled Project');
  const [deploymentRefreshKey, setDeploymentRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  // Platform settings
  const [edition, setEdition] = useState<'java' | 'bedrock'>('java');
  const [platform, setPlatform] = useState<'fabric' | 'bukkit' | 'bedrock'>('fabric');
  const [minecraftVersion, setMinecraftVersion] = useState('1.21.1');

  // Launcher state
  const [showLauncher, setShowLauncher] = useState(true);
  const [isLauncherLoading, setIsLauncherLoading] = useState(true);

  // Load settings and check if launcher should be shown
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if launcher has been completed
        const launcherCompleted = await dbGetSetting('launcher_completed');

        if (launcherCompleted === 'true') {
          setShowLauncher(false);
        }

        // Load platform settings
        const platformSetting = await dbGetSetting('platform');
        const editionSetting = await dbGetSetting('edition');
        const versionSetting = await dbGetSetting('minecraft_version');

        if (platformSetting) setPlatform(platformSetting as 'fabric' | 'bukkit' | 'bedrock');
        if (editionSetting) setEdition(editionSetting as 'java' | 'bedrock');
        if (versionSetting) setMinecraftVersion(versionSetting);

        console.log('Platform settings loaded:', { platform: platformSetting, edition: editionSetting, version: versionSetting });
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLauncherLoading(false);
      }
    };

    loadSettings();
  }, []);

  const showMessage = (title: string, content: string) => {
    setMessageTitle(title);
    setMessageContent(content);
    setShowMessageModal(true);
  };

  const handleWorkspaceChange = useCallback((workspace: Blockly.WorkspaceSvg) => {
    workspaceRef.current = workspace;
    // Auto-save could be added here in the future
  }, []);

  const handleLoadExample = (workspaceXml: string) => {
    console.log('[App] handleLoadExample called');
    console.log('[App] workspace exists:', !!workspaceRef.current);
    console.log('[App] XML length:', workspaceXml?.length);

    if (workspaceRef.current) {
      try {
        loadWorkspace(workspaceRef.current, workspaceXml);
        console.log('[App] Example loaded successfully');
      } catch (error) {
        console.error('[App] Error loading example:', error);
        showMessage(t('messages.error'), t('messages.errorLoadingExample') + error);
      }
    } else {
      console.error('[App] No workspace reference!');
      showMessage(t('messages.error'), t('messages.workspaceNotInitialized'));
    }
  };

  const handleLoadProject = (workspaceXml: string, name: string) => {
    if (workspaceRef.current) {
      try {
        loadWorkspace(workspaceRef.current, workspaceXml);
        setProjectName(name);
        console.log('Project loaded:', name);
      } catch (error) {
        console.error('Error loading project:', error);
        showMessage(t('messages.error'), t('messages.errorLoadingProject') + error);
      }
    }
  };

  const handleNew = () => {
    setShowNewProjectModal(true);
  };

  const handleNewConfirm = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      setProjectName('Untitled Project');
      console.log('New project created');
      setShowNewProjectModal(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceRef.current) {
      showMessage(t('messages.error'), t('messages.noWorkspaceToSave'));
      return;
    }

    setTempProjectName(projectName);
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!workspaceRef.current) return;

    try {
      const xmlText = serializeWorkspace(workspaceRef.current);
      if (!tempProjectName.trim()) return;

      await dbSaveProject(tempProjectName.trim(), xmlText, platform, edition, minecraftVersion);
      setProjectName(tempProjectName.trim());
      setShowSaveModal(false);
      showMessage(t('messages.success'), t('messages.projectSavedSuccessfully'));
    } catch (error) {
      console.error('Save error:', error);
      showMessage(t('messages.error'), t('messages.errorSavingProject') + error);
    }
  };

  const handleCompile = async () => {
    if (!workspaceRef.current || isCompiling || isDeploying) {
      return;
    }

    // Require save if project is untitled (case-insensitive)
    if (projectName.toLowerCase().trim() === 'untitled project') {
      setTempProjectName(projectName);
      setShowSaveModal(true);
      showMessage(t('messages.saveRequired'), t('messages.saveBeforeCompile'));
      return;
    }

    setIsCompiling(true);
    try {
      // Generate mod data from workspace
      const modData = await generateModData(workspaceRef.current, platform);

      // Validate mod data
      const errors = validateModData(modData);
      if (errors.length > 0) {
        showMessage(t('messages.validationErrors'), errors.join('\n'));
        return;
      }

      showMessage(t('messages.buildSuccessful'), t('messages.buildSuccessMessage'));
    } catch (error) {
      console.error('Compile error:', error);
      showMessage(t('messages.compileError'), String(error));
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!workspaceRef.current || isCompiling || isDeploying) {
      return;
    }

    // Require save if project is untitled (case-insensitive)
    if (projectName.toLowerCase().trim() === 'untitled project') {
      setTempProjectName(projectName);
      setShowSaveModal(true);
      showMessage(t('messages.saveRequired'), t('messages.saveBeforeDeploy'));
      return;
    }

    setIsDeploying(true);
    try {
      // Generate mod data from workspace
      const modData = await generateModData(workspaceRef.current, platform);

      // Validate mod data
      const errors = validateModData(modData);
      if (errors.length > 0) {
        showMessage(t('messages.validationErrors'), errors.join('\n'));
        return;
      }

      // Deploy to Python API (route to correct API based on platform)
      console.log('Deploying mod data:', modData);
      console.log('Platform:', platform);
      console.log('blockDisplayModels count:', modData.blockDisplayModels?.length || 0);

      // Route to platform-specific deployment API
      const deploymentPort = platform === 'bukkit' ? 8586 : platform === 'bedrock' ? 8587 : 8585;  // 8585=Fabric, 8586=Bukkit, 8587=Bedrock
      const response = await fetch(`http://localhost:${deploymentPort}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modData,
          projectId: projectName.toLowerCase().replace(/\s+/g, '_'),
          projectName: projectName,
          platform: platform,  // Pass platform to backend
        }),
      });

      const result = await response.json();

      if (result.success) {
        showMessage(t('messages.deploymentSuccess'), t('messages.deploymentSuccessMessage') + '\n\n' + result.message);
        // Store deployment in localStorage
        const deployments = JSON.parse(localStorage.getItem('blocklycraft_deployments') || '[]');
        if (!deployments.find((d: any) => d.projectName === projectName)) {
          deployments.push({
            projectName,
            deployedAt: Date.now(),
          });
          localStorage.setItem('blocklycraft_deployments', JSON.stringify(deployments));
        }
        // Trigger refresh of deployment status
        setDeploymentRefreshKey(prev => prev + 1);
      } else {
        showMessage(t('messages.deploymentFailed'), result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Deploy error:', error);
      showMessage(t('messages.deploymentError'), String(error));
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploymentChange = () => {
    setDeploymentRefreshKey(prev => prev + 1);
  };

  const handleProjectNameClick = () => {
    setTempProjectName(projectName);
    setShowRenameModal(true);
  };

  const handleRenameConfirm = () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
      setShowRenameModal(false);
    }
  };

  const handleLauncherSubmit = async (selectedServers: string[], rememberChoice: boolean) => {
    console.log('Launcher submitted:', { selectedServers, rememberChoice });

    // Determine platform based on server selection
    // Priority: fabric > bukkit > bedrock (if multiple selected)
    let selectedPlatform: 'fabric' | 'bukkit' | 'bedrock' = 'fabric';
    if (selectedServers.includes('fabric')) {
      selectedPlatform = 'fabric';
    } else if (selectedServers.includes('bukkit')) {
      selectedPlatform = 'bukkit';
    } else if (selectedServers.includes('bedrock')) {
      selectedPlatform = 'bedrock';
    }

    // Set platform for block filtering
    setPlatform(selectedPlatform);

    // Save platform to database
    try {
      await dbSaveSetting('platform', selectedPlatform);
      console.log('Platform set to:', selectedPlatform);
    } catch (error) {
      console.error('Failed to save platform:', error);
    }

    // Start selected servers
    for (const serverId of selectedServers) {
      try {
        console.log(`Starting ${serverId} server...`);
        await startServer(serverId as 'fabric' | 'bukkit' | 'bedrock');
        console.log(`${serverId} server started successfully`);
      } catch (error) {
        console.error(`Failed to start ${serverId} server:`, error);
        // Continue with other servers even if one fails
      }
    }

    // Save preferences if user wants to remember
    if (rememberChoice) {
      try {
        await dbSaveSetting('launcher_servers', JSON.stringify(selectedServers));
        await dbSaveSetting('launcher_local_mode', selectedServers.length === 0 ? 'true' : 'false');
        await dbSaveSetting('launcher_remember', 'true');
        await dbSaveSetting('launcher_completed', 'true');
      } catch (error) {
        console.error('Failed to save launcher preferences:', error);
      }
    } else {
      // Still mark as completed, just don't remember the choices
      try {
        await dbSaveSetting('launcher_completed', 'true');
      } catch (error) {
        console.error('Failed to save launcher completion:', error);
      }
    }

    // Hide launcher and show main app
    setShowLauncher(false);
  };

  if (isLauncherLoading) {
    return null; // Or a loading spinner
  }

  if (showLauncher) {
    return <LauncherScreen onLaunch={handleLauncherSubmit} />;
  }

  return (
    <div className="app-container">
      <Header
        projectName={projectName}
        onNew={handleNew}
        onSave={handleSave}
        onCompile={handleCompile}
        onDeploy={handleDeploy}
        onSettings={() => setShowSettings(true)}
        onProjectNameClick={handleProjectNameClick}
        isCompiling={isCompiling}
        isDeploying={isDeploying}
      />
      <div className="editor-container">
        <ExamplesPanel
          onLoadExample={handleLoadExample}
          onLoadProject={handleLoadProject}
          deploymentRefreshKey={deploymentRefreshKey}
          onDeploymentChange={handleDeploymentChange}
          platform={platform}
        />
        <BlocklyEditor onWorkspaceChange={handleWorkspaceChange} platform={platform} />
      </div>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title={t('modals.renameProject.title')}
        actions={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowRenameModal(false)}
            >
              {t('modals.renameProject.cancel')}
            </button>
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleRenameConfirm}
            >
              {t('modals.renameProject.save')}
            </button>
          </>
        }
      >
        <div style={{ padding: '1rem' }}>
          <label htmlFor="project-name-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t('modals.renameProject.label')}
          </label>
          <input
            id="project-name-input"
            type="text"
            value={tempProjectName}
            onChange={(e) => setTempProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              background: '#fff',
              color: '#000'
            }}
            autoFocus
          />
        </div>
      </Modal>
      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title={t('modals.newProject.title')}
        actions={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowNewProjectModal(false)}
            >
              {t('modals.newProject.cancel')}
            </button>
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleNewConfirm}
            >
              {t('modals.newProject.confirm')}
            </button>
          </>
        }
      >
        <div style={{ padding: '1rem' }}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {t('modals.newProject.message')}
          </p>
        </div>
      </Modal>
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={t('modals.saveProject.title')}
        actions={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowSaveModal(false)}
            >
              {t('modals.saveProject.cancel')}
            </button>
            <button
              className="modal-btn modal-btn-success"
              onClick={handleSaveConfirm}
            >
              {t('modals.saveProject.save')}
            </button>
          </>
        }
      >
        <div style={{ padding: '1rem' }}>
          <label htmlFor="save-project-name-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t('modals.saveProject.label')}
          </label>
          <input
            id="save-project-name-input"
            type="text"
            value={tempProjectName}
            onChange={(e) => setTempProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveConfirm()}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              background: '#fff',
              color: '#000'
            }}
            autoFocus
          />
        </div>
      </Modal>
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageTitle}
        actions={
          <button
            className="modal-btn modal-btn-primary"
            onClick={() => setShowMessageModal(false)}
          >
            {t('modals.message.ok')}
          </button>
        }
      >
        <div style={{ padding: '1rem' }}>
          <textarea
            readOnly
            value={messageContent}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              background: '#f5f5f5',
              color: '#000',
              resize: 'vertical'
            }}
            onClick={(e) => e.currentTarget.select()}
          />
          <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem', color: '#666' }}>
            {t('modals.message.copyHint')}
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;
