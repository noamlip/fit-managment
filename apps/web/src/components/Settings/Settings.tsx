import { useConfig } from '../../context/ConfigContext';
import './Settings.scss';

export const Settings: React.FC = () => {
    const { trainerName, userRole, logout } = useConfig();
    return (
        <div className="settings-page">
            <h2>Settings</h2>
            <p>
                Signed in as <strong>{trainerName}</strong> ({userRole})
            </p>
            <button type="button" onClick={logout}>
                Log out
            </button>
        </div>
    );
};
