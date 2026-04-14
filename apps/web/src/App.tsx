import { lazy, Suspense, useState, useEffect } from 'react';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { NutritionPlanCommitProvider } from './context/NutritionPlanCommitContext';

import { TrainerSelection } from './components/TrainerSelection/TrainerSelection';
import { Layout, type AppPage } from './components/Layout/Layout';
import { TraineeProvider } from './context/TraineeContext';
import { WorkoutProvider } from './context/WorkoutContext';

const NutritionTable = lazy(() =>
    import('./components/NutritionTable/NutritionTable.tsx').then((m) => ({ default: m.NutritionTable }))
);
const TraineeDashboard = lazy(() =>
    import('./components/TraineeDashboard/TraineeDashboard.tsx').then((m) => ({ default: m.TraineeDashboard }))
);
const TraineeWorkoutPanel = lazy(() =>
    import('./containers/TraineeWorkoutPanel/TraineeWorkoutPanel.tsx').then((m) => ({
        default: m.TraineeWorkoutPanel,
    }))
);
const TraineeHome = lazy(() =>
    import('./containers/TraineeHome/TraineeHome.tsx').then((m) => ({ default: m.TraineeHome }))
);
const Settings = lazy(() =>
    import('./components/Settings/Settings.tsx').then((m) => ({ default: m.Settings }))
);
const PaymentsPage = lazy(() =>
    import('./containers/Payments/PaymentsPage.tsx').then((m) => ({ default: m.PaymentsPage }))
);

function RouteFallback() {
    return (
        <div className="route-loading" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            <div
                style={{
                    width: 40,
                    height: 40,
                    margin: '0 auto 1rem',
                    border: '3px solid rgba(0, 242, 255, 0.2)',
                    borderTopColor: '#00f2ff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading…
        </div>
    );
}

const Content = () => {
    const { trainerName, userRole } = useConfig();
    const [activePage, setActivePage] = useState<AppPage>('home');

    useEffect(() => {
        setActivePage('home');
    }, [userRole]);

    useEffect(() => {
        if (userRole === 'coach' && (activePage === 'workouts' || activePage === 'nutrition')) {
            setActivePage('home');
        }
    }, [userRole, activePage]);

    if (!trainerName) {
        return <TrainerSelection />;
    }

    return (
        <Layout activePage={activePage} onNavigate={setActivePage}>
            <Suspense fallback={<RouteFallback />}>
                {activePage === 'home' &&
                    (userRole === 'coach' ? <TraineeDashboard /> : <TraineeHome />)}

                {activePage === 'payments' && userRole === 'coach' && <PaymentsPage />}

                {activePage === 'workouts' && userRole !== 'coach' && <TraineeWorkoutPanel />}

                {activePage === 'nutrition' && userRole !== 'coach' && <NutritionTable />}

                {activePage === 'settings' && <Settings />}
            </Suspense>
        </Layout>
    );
};

function App() {
    return (
        <ConfigProvider>
            <TraineeProvider>
                <NutritionPlanCommitProvider>
                    <WorkoutProvider>
                        <Content />
                    </WorkoutProvider>
                </NutritionPlanCommitProvider>
            </TraineeProvider>
        </ConfigProvider>
    );
}

export default App;
