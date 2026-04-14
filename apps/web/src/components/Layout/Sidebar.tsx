import {
    LayoutDashboard,
    Dumbbell,
    Utensils,
    Settings,
    LogOut,
    Activity,
    CreditCard,
    Library,
} from 'lucide-react';
import './Sidebar.scss';
import { useConfig } from '../../context/ConfigContext';
import type { AppPage } from './Layout';

interface SidebarProps {
    activePage: AppPage;
    onNavigate: (page: AppPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
    const { trainerName, logout, userRole } = useConfig();
    const isCoach = userRole === 'coach';

    return (
        <aside className="sidebar">
            <div className="brand">
                <Activity className="logo-icon" size={28} />
                <h1>Anti-Gravity</h1>
            </div>

            <nav>
                <div
                    className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
                    onClick={() => onNavigate('home')}
                >
                    <LayoutDashboard className="icon" />
                    <span>{isCoach ? 'Trainees' : 'Home'}</span>
                </div>

                {isCoach && (
                    <div
                        className={`nav-item ${activePage === 'payments' ? 'active' : ''}`}
                        onClick={() => onNavigate('payments')}
                    >
                        <CreditCard className="icon" />
                        <span>Payments</span>
                    </div>
                )}

                {isCoach && (
                    <div
                        className={`nav-item ${activePage === 'library' ? 'active' : ''}`}
                        onClick={() => onNavigate('library')}
                    >
                        <Library className="icon" />
                        <span>Exercise library</span>
                    </div>
                )}

                <div
                    className={`nav-item ${activePage === 'workouts' ? 'active' : ''}`}
                    onClick={() => onNavigate('workouts')}
                >
                    <Dumbbell className="icon" />
                    <span>Workouts</span>
                </div>

                <div
                    className={`nav-item ${activePage === 'nutrition' ? 'active' : ''}`}
                    onClick={() => onNavigate('nutrition')}
                >
                    <Utensils className="icon" />
                    <span>Nutrition</span>
                </div>

                <div
                    className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
                    onClick={() => onNavigate('settings')}
                >
                    <Settings className="icon" />
                    <span>Settings</span>
                </div>
            </nav>

            <div className="user-profile">
                <div className="avatar">{trainerName?.charAt(0).toUpperCase()}</div>
                <div className="info">
                    <span className="name">{trainerName}</span>
                    <span className="role">{isCoach ? 'Head Coach' : 'Trainee'}</span>
                </div>
                <button type="button" className="logout-btn" onClick={logout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};
