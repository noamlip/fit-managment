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
    /** When true, sidebar uses fixed drawer positioning (narrow viewport). */
    isMobileDrawer?: boolean;
    /** Whether the mobile drawer is visible. */
    drawerOpen?: boolean;
    /** Called after logout so the drawer can close. */
    onDrawerClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activePage,
    onNavigate,
    isMobileDrawer = false,
    drawerOpen = false,
    onDrawerClose,
}) => {
    const { trainerName, logout, userRole } = useConfig();
    const isCoach = userRole === 'coach';

    const asideClass = [
        'sidebar',
        isMobileDrawer ? 'sidebar--drawer' : '',
        isMobileDrawer && drawerOpen ? 'sidebar--open' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const handleLogout = (): void => {
        logout();
        onDrawerClose?.();
    };

    return (
        <aside className={asideClass} aria-hidden={isMobileDrawer ? !drawerOpen : undefined}>
            <div className="brand">
                <Activity className="logo-icon" size={28} />
                <h1>TOMER-ZONE</h1>
            </div>

            <nav id="app-sidebar-nav">
                <div
                    className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
                    onClick={() => onNavigate('home')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigate('home');
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <LayoutDashboard className="icon" />
                    <span>{isCoach ? 'Trainees' : 'Home'}</span>
                </div>

                {isCoach && (
                    <div
                        className={`nav-item ${activePage === 'payments' ? 'active' : ''}`}
                        onClick={() => onNavigate('payments')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onNavigate('payments');
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <CreditCard className="icon" />
                        <span>Payments</span>
                    </div>
                )}

                {isCoach && (
                    <div
                        className={`nav-item ${activePage === 'library' ? 'active' : ''}`}
                        onClick={() => onNavigate('library')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onNavigate('library');
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <Library className="icon" />
                        <span>Exercise library</span>
                    </div>
                )}

                <div
                    className={`nav-item ${activePage === 'workouts' ? 'active' : ''}`}
                    onClick={() => onNavigate('workouts')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigate('workouts');
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <Dumbbell className="icon" />
                    <span>Workouts</span>
                </div>

                <div
                    className={`nav-item ${activePage === 'nutrition' ? 'active' : ''}`}
                    onClick={() => onNavigate('nutrition')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigate('nutrition');
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <Utensils className="icon" />
                    <span>Nutrition</span>
                </div>

                <div
                    className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
                    onClick={() => onNavigate('settings')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigate('settings');
                        }
                    }}
                    role="button"
                    tabIndex={0}
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
                <button type="button" className="logout-btn" onClick={handleLogout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};
