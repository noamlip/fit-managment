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
const CoachNeedsTraineePlaceholder = lazy(() =>
    import('./components/CoachNeedsTraineePlaceholder/CoachNeedsTraineePlaceholder.tsx').then((m) => ({
        default: m.CoachNeedsTraineePlaceholder,
    }))
);
const CoachPageChrome = lazy(() =>
    import('./components/CoachPageChrome/CoachPageChrome.tsx').then((m) => ({ default: m.CoachPageChrome }))
);
const ExerciseLibraryPage = lazy(() =>
    import('./containers/ExerciseLibraryPage/ExerciseLibraryPage.tsx').then((m) => ({
        default: m.ExerciseLibraryPage,
    }))
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
    const { trainerName, userRole, selectedTrainee } = useConfig();
    const [activePage, setActivePage] = useState<AppPage>('home');

    useEffect(() => {
        setActivePage('home');
    }, [userRole]);

    if (!trainerName) {
        return <TrainerSelection />;
    }

    return (
        <Layout activePage={activePage} onNavigate={setActivePage}>
            <Suspense fallback={<RouteFallback />}>
                {activePage === 'home' &&
                    (userRole === 'coach' ? (
                        <TraineeDashboard onNavigate={setActivePage} />
                    ) : (
                        <TraineeHome />
                    ))}

                {activePage === 'payments' && userRole === 'coach' && <PaymentsPage />}

                {activePage === 'workouts' &&
                    userRole === 'coach' &&
                    !selectedTrainee && (
                        <CoachNeedsTraineePlaceholder page="workouts" onNavigate={setActivePage} />
                    )}

                {activePage === 'workouts' && (userRole !== 'coach' || selectedTrainee) && (
                    userRole === 'coach' ? (
                        <CoachPageChrome sectionTitle="Workouts">
                            <TraineeWorkoutPanel />
                        </CoachPageChrome>
                    ) : (
                        <TraineeWorkoutPanel />
                    )
                )}

                {activePage === 'nutrition' &&
                    userRole === 'coach' &&
                    !selectedTrainee && (
                        <CoachNeedsTraineePlaceholder page="nutrition" onNavigate={setActivePage} />
                    )}

                {activePage === 'nutrition' && (userRole !== 'coach' || selectedTrainee) && (
                    userRole === 'coach' ? (
                        <CoachPageChrome sectionTitle="Nutrition">
                            <NutritionTable hidePanelTitle variant="coach" />
                        </CoachPageChrome>
                    ) : (
                        <NutritionTable />
                    )
                )}

                {activePage === 'library' && userRole === 'coach' && (
                    <CoachPageChrome sectionTitle="Exercise library">
                        <ExerciseLibraryPage />
                    </CoachPageChrome>
                )}

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
