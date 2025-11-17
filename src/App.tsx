import { useState, useRef, useCallback } from 'react';
import Header from '@/components/Header/Header';
import BlocklyEditor from '@/components/BlocklyEditor/BlocklyEditor';
import ExamplesPanel from '@/components/ExamplesPanel/ExamplesPanel';
import SettingsModal from '@/components/SettingsModal/SettingsModal';
import Modal from '@/components/Modal/Modal';
import type * as Blockly from 'blockly';
import {
  generateModData,
  serializeWorkspace,
  loadWorkspace,
  validateModData,
} from '@/utils/blockly-generator';
import { dbSaveProject } from '@/utils/database';
import './App.css';

function App() {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [deploymentRefreshKey, setDeploymentRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

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
        alert('Error loading example: ' + error);
      }
    } else {
      console.error('[App] No workspace reference!');
      alert('Workspace not initialized');
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
        alert('Error loading project: ' + error);
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
      alert('No workspace to save');
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

      await dbSaveProject(tempProjectName.trim(), xmlText);
      setProjectName(tempProjectName.trim());
      setShowSaveModal(false);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving project: ' + error);
    }
  };

  const handleCompile = async () => {
    if (!workspaceRef.current) {
      alert('No workspace to compile');
      return;
    }

    try {
      // Generate mod data from workspace
      const modData = generateModData(workspaceRef.current);

      // Validate mod data
      const errors = validateModData(modData);
      if (errors.length > 0) {
        alert('Validation errors:\n' + errors.join('\n'));
        return;
      }

      alert('Build successful! Use "Deploy Mod" to deploy to the server.');
    } catch (error) {
      console.error('Compile error:', error);
      alert('Error compiling mod: ' + error);
    }
  };

  const handleDeploy = async () => {
    if (!workspaceRef.current) {
      alert('No workspace to deploy');
      return;
    }

    try {
      // Generate mod data from workspace
      const modData = generateModData(workspaceRef.current);

      // Validate mod data
      const errors = validateModData(modData);
      if (errors.length > 0) {
        alert('Validation errors:\n' + errors.join('\n'));
        return;
      }

      // Deploy to Python API
      console.log('Deploying mod data:', modData);
      const response = await fetch('http://localhost:8585/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modData,
          projectId: projectName.toLowerCase().replace(/\s+/g, '_'),
          projectName: projectName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Mod deployed successfully!\n\n' + result.message);
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
        alert('Deployment failed:\n' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Deploy error:', error);
      alert('Error deploying mod: ' + error);
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
      />
      <div className="editor-container">
        <ExamplesPanel
          onLoadExample={handleLoadExample}
          onLoadProject={handleLoadProject}
          deploymentRefreshKey={deploymentRefreshKey}
          onDeploymentChange={handleDeploymentChange}
        />
        <BlocklyEditor onWorkspaceChange={handleWorkspaceChange} />
      </div>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Project"
        actions={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowRenameModal(false)}
            >
              Cancel
            </button>
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleRenameConfirm}
            >
              Save
            </button>
          </>
        }
      >
        <div style={{ padding: '1rem' }}>
          <label htmlFor="project-name-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Project Name:
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
        title="New Project"
        actions={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowNewProjectModal(false)}
            >
              Cancel
            </button>
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleNewConfirm}
            >
              Create New Project
            </button>
          </>
        }
      >
        <div style={{ padding: '1rem' }}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Are you sure you want to create a new project? Unsaved changes will be lost.
          </p>
        </div>
      </Modal>
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Project"
        actions={
          <>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </button>
            <button
              className="modal-btn modal-btn-success"
              onClick={handleSaveConfirm}
            >
              Save
            </button>
          </>
        }
      >
        <div style={{ padding: '1rem' }}>
          <label htmlFor="save-project-name-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Project Name:
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
    </div>
  );
}

export default App;
