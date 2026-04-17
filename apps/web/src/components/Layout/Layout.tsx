import { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CoachContextBar } from '../CoachContextBar/CoachContextBar';
import { useNavDrawerBreakpoint } from '../../hooks/useNavDrawerBreakpoint';
import './Layout.scss';

export type AppPage = 'home' | 'payments' | 'workouts' | 'nutrition' | 'settings' | 'library';

interface LayoutProps {
    children: React.ReactNode;
    activePage: AppPage;
    onNavigate: (page: AppPage) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
    const isMobileNav = useNavDrawerBreakpoint();
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        if (!isMobileNav) {
            setNavOpen(false);
        }
    }, [isMobileNav]);

    useEffect(() => {
        if (isMobileNav && navOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
        return undefined;
    }, [isMobileNav, navOpen]);

    const handleNavigate = useCallback(
        (page: AppPage) => {
            onNavigate(page);
            setNavOpen(false);
        },
        [onNavigate]
    );

    return (
        <div
            className={`layout-container${isMobileNav ? ' layout-container--mobile-nav' : ''}${navOpen ? ' layout-container--nav-open' : ''}`}
        >
            {isMobileNav && navOpen ? (
                <button
                    type="button"
                    className="layout-backdrop"
                    aria-label="Close navigation menu"
                    onClick={() => setNavOpen(false)}
                />
            ) : null}
            <Sidebar
                activePage={activePage}
                onNavigate={handleNavigate}
                drawerOpen={isMobileNav && navOpen}
                isMobileDrawer={isMobileNav}
                onDrawerClose={() => setNavOpen(false)}
            />
            <main className="main-content">
                {isMobileNav ? (
                    <header className="layout-mobile-bar">
                        <button
                            type="button"
                            className="layout-mobile-menu-btn"
                            aria-expanded={navOpen}
                            aria-controls="app-sidebar-nav"
                            onClick={() => setNavOpen((o) => !o)}
                        >
                            {navOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
                        </button>
                        <span className="layout-mobile-title">Anti-Gravity</span>
                    </header>
                ) : null}
                <CoachContextBar />
                {children}
            </main>
        </div>
    );
};
