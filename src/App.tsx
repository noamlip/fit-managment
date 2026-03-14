import { useState, useEffect } from 'react';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { TraineeProvider } from './context/TraineeContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { NutritionTable } from './components/NutritionTable/NutritionTable';
import { TrainerSelection } from './components/TrainerSelection/TrainerSelection';
import { MenuEditor } from './components/MenuEditor/MenuEditor';
import { Layout } from './components/Layout/Layout';
import { TraineeDashboard } from './components/TraineeDashboard/TraineeDashboard';
import { WorkoutLibrary } from './containers/WorkoutLibrary/WorkoutLibrary';
import { TraineeWorkoutPanel } from './containers/TraineeWorkoutPanel/TraineeWorkoutPanel';
import { Settings } from './components/Settings/Settings';
// import './App.scss'; // Layout handles styles now

const Content = () => {
  const { trainerName, userRole } = useConfig();
  const [activePage, setActivePage] = useState<'dashboard' | 'workouts' | 'nutrition' | 'settings'>('nutrition');

  // Reset active page on login
  useEffect(() => {
    if (userRole === 'coach') {
      setActivePage('dashboard');
    } else {
      setActivePage('nutrition');
    }
  }, [userRole]);

  // If no trainer selected, show login screen
  if (!trainerName) {
    return <TrainerSelection />;
  }

  // Once logged in, show the Layout
  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && userRole === 'coach' && (
        <TraineeDashboard />
      )}

      {activePage === 'workouts' && (
        userRole === 'coach' ? <WorkoutLibrary /> : <TraineeWorkoutPanel />
      )}

      {activePage === 'nutrition' && (
        <>
          <NutritionTable />
          <MenuEditor />
        </>
      )}

      {activePage === 'settings' && (
        <Settings />
      )}
    </Layout>
  );
};

function App() {
  return (
    <ConfigProvider>
      <TraineeProvider>
        <WorkoutProvider>
          <Content />
        </WorkoutProvider>
      </TraineeProvider>
    </ConfigProvider>
  );
}

export default App;
