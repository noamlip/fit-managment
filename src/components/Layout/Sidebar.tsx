import React from 'react';
import {
    LayoutDashboard,
    Dumbbell,
    Utensils,
    Settings,
    LogOut,
    Activity
} from 'lucide-react';
import './Sidebar.scss';
import { useConfig } from '../../context/ConfigContext';

interface SidebarProps {
    activePage: 'dashboard' | 'workouts' | 'nutrition' | 'settings';
    onNavigate: (page: 'dashboard' | 'workouts' | 'nutrition' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
    const { trainerName, logout, userRole } = useConfig();

    return (
        <aside className="sidebar">
            <div className="brand">
                <Activity className="logo-icon" size={28} />
                <h1>Anti-Gravity</h1>
            </div>

            <nav>
                {userRole === 'coach' && (
                    <div
                        className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onNavigate('dashboard')}
                    >
                        <LayoutDashboard className="icon" />
                        <span>Dashboard</span>
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
                <div className="avatar">
                    {trainerName?.charAt(0).toUpperCase()}
                </div>
                <div className="info">
                    <span className="name">{trainerName}</span>
                    <span className="role">{userRole === 'coach' ? 'Head Coach' : 'Trainee'}</span>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};
