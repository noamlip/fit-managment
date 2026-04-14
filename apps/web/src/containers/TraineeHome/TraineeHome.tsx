import { useMemo, type FC } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { GoalsOverview } from './components/GoalsOverview';
import { WeeklyFeedback } from './components/WeeklyFeedback';
import './TraineeHome.scss';

export const TraineeHome: FC = () => {
    const { trainerName } = useConfig();
    const { trainees } = useTrainee();
    const activeTrainee = useMemo(() => trainees.find((t) => t.name === trainerName), [trainees, trainerName]);

    return (
        <div className="trainee-home">
            <h1>Hello, {trainerName}</h1>
            <p style={{ color: '#a0a0a0' }}>Your progress at a glance</p>

            <GoalsOverview activeTrainee={activeTrainee} />
            <WeeklyFeedback trainee={activeTrainee} />
        </div>
    );
};
