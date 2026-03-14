import React from 'react';
import type { Trainee } from '../../types';
import { WeightChart } from '../WeightChart/WeightChart';

interface IProgressTabProps {
    trainee: Trainee;
}

export const ProgressTab: React.FC<IProgressTabProps> = ({ trainee }) => {
    return (
        <div className="progress-view" style={{ padding: '0 1rem' }}>
            <h3>Weight Progress</h3>
            <WeightChart
                history={trainee.weightHistory || []}
                currentWeight={trainee.metrics.weight}
            />
        </div>
    );
};
