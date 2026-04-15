import React from 'react';
import type { Trainee } from '../../types';
import { GoalsOverview } from '../../containers/TraineeHome/components/GoalsOverview';
import { DailyWeightTracker } from '../../containers/TraineeHome/components/DailyWeightTracker';

interface IProgressTabProps {
    trainee: Trainee;
}

export const ProgressTab: React.FC<IProgressTabProps> = ({ trainee }) => {
    return (
        <div className="progress-view" style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <GoalsOverview activeTrainee={trainee} readOnly />
            <DailyWeightTracker activeTrainee={trainee} />
        </div>
    );
};
