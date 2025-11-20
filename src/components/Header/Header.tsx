import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faSave,
  faHammer,
  faCog,
  faSpinner,
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
  isCompiling?: boolean;
  isDeploying?: boolean;
}

export default function Header({
  projectName = 'Untitled Project',
  onSave,
  onNew,
  onCompile,
  onDeploy,
  onSettings,
  onProjectNameClick,
  isCompiling = false,
  isDeploying = false,
}: HeaderProps) {
  const { t } = useTranslation();
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
        <button className="header-btn" onClick={onNew} title={t('header.new')}>
          <FontAwesomeIcon icon={faFile} />
          <span className="btn-text">{t('header.new')}</span>
        </button>
        <button className="header-btn" onClick={onSave} title={t('header.save')}>
          <FontAwesomeIcon icon={faSave} />
          <span className="btn-text">{t('header.save')}</span>
        </button>
        <button
          className="header-btn"
          onClick={onCompile}
          title={t('header.compile')}
          disabled={isCompiling || isDeploying}
        >
          <FontAwesomeIcon icon={isCompiling ? faSpinner : faHammer} spin={isCompiling} />
          <span className="btn-text">{t('header.compile')}</span>
        </button>
        <button
          className="header-btn deploy-btn"
          onClick={onDeploy}
          title={t('header.deploy')}
          disabled={isCompiling || isDeploying}
        >
          <FontAwesomeIcon icon={isDeploying ? faSpinner : faHammer} spin={isDeploying} />
          <span className="btn-text">{t('header.deploy')}</span>
        </button>
        <button
          className="header-btn"
          onClick={onSettings}
          title={t('header.settings')}
        >
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>
    </header>
  );
}
