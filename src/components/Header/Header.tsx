import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faFolderOpen,
  faSave,
  faHammer,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import './Header.css';

interface HeaderProps {
  projectName?: string;
  onSave?: () => void;
  onNew?: () => void;
  onCompile?: () => void;
  onDeploy?: () => void;
  onSettings?: () => void;
  onProjectNameClick?: () => void;
}

export default function Header({
  projectName = 'Untitled Project',
  onSave,
  onNew,
  onCompile,
  onDeploy,
  onSettings,
  onProjectNameClick,
}: HeaderProps) {
  return (
    <header className="blocklycraft-header">
      <div className="header-left">
        <img src="/logo.png" alt="BlocklyCraft" className="header-logo" />
      </div>

      <div className="header-center">
        <span
          className="project-name"
          onClick={onProjectNameClick}
          style={{ cursor: onProjectNameClick ? 'pointer' : 'default' }}
          title={onProjectNameClick ? 'Click to edit project name' : ''}
        >
          {projectName}
        </span>
      </div>

      <div className="header-right">
        <button className="header-btn" onClick={onNew} title="New Project">
          <FontAwesomeIcon icon={faFile} />
          <span className="btn-text">New</span>
        </button>
        <button className="header-btn" onClick={onSave} title="Save Project">
          <FontAwesomeIcon icon={faSave} />
          <span className="btn-text">Save</span>
        </button>
        <button
          className="header-btn"
          onClick={onCompile}
          title="Compile Mod"
        >
          <FontAwesomeIcon icon={faHammer} />
          <span className="btn-text">Compile</span>
        </button>
        <button
          className="header-btn deploy-btn"
          onClick={onDeploy}
          title="Deploy Mod"
        >
          <FontAwesomeIcon icon={faHammer} />
          <span className="btn-text">Deploy Mod</span>
        </button>
        <button
          className="header-btn"
          onClick={onSettings}
          title="Settings"
        >
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>
    </header>
  );
}
