import { Sidebar } from './Sidebar';
import './Layout.scss';

export type AppPage = 'home' | 'payments' | 'workouts' | 'nutrition' | 'settings';

interface LayoutProps {
    children: React.ReactNode;
    activePage: AppPage;
    onNavigate: (page: AppPage) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
    return (
        <div className="layout-container">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />
            <main className="main-content">{children}</main>
        </div>
    );
};
