import React from 'react';
import { Sidebar } from './Sidebar';
import './Layout.scss';

interface LayoutProps {
    children: React.ReactNode;
    activePage: 'dashboard' | 'workouts' | 'nutrition' | 'settings';
    onNavigate: (page: 'dashboard' | 'workouts' | 'nutrition' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
    return (
        <div className="layout-container">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
