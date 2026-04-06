import React, { useMemo } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { DailyWeightTracker } from './components/DailyWeightTracker';
import { GoalsOverview } from './components/GoalsOverview';
import { WeeklyFeedback } from './components/WeeklyFeedback';
import './TraineeHome.scss';

export const TraineeHome: React.FC = () => {
    const { trainerName } = useConfig();
    const { trainees } = useTrainee();

    const activeTrainee = useMemo(() => trainees.find(t => t.name === trainerName), [trainees, trainerName]);

    return (
        <div className="trainee-home-panel">
            <header className="panel-header">
                <div className="welcome">
                    <h1>Home, {trainerName}</h1>
                    <p>Track your overall progress and log your weekly feedback.</p>
                </div>
            </header>
            
            <GoalsOverview activeTrainee={activeTrainee} />
            <WeeklyFeedback trainee={activeTrainee} />
            <DailyWeightTracker activeTrainee={activeTrainee} />
        </div>
    );
};
