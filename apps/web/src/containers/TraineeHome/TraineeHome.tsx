import { useMemo, useState, type FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import type { AppPage } from '../../components/Layout/Layout';
import { GoalsOverview } from './components/GoalsOverview';
import { WeeklyFeedback } from './components/WeeklyFeedback';
import { TraineeHubOverlay } from './TraineeHubOverlay';
import './TraineeHome.scss';

interface TraineeHomeProps {
    onNavigate: (page: AppPage) => void;
}

export const TraineeHome: FC<TraineeHomeProps> = ({ onNavigate }) => {
    const { trainerName } = useConfig();
    const { trainees, updateTrainee } = useTrainee();
    const [hubOpen, setHubOpen] = useState(false);
    const activeTrainee = useMemo(() => trainees.find((t) => t.name === trainerName), [trainees, trainerName]);

    return (
        <div className="trainee-home">
            <h1>Hello, {trainerName}</h1>
            <p style={{ color: '#a0a0a0' }}>Your progress at a glance</p>

            <button type="button" className="trainee-home-hub-entry" onClick={() => setHubOpen(true)}>
                <div className="trainee-home-hub-entry-inner">
                    <div className="trainee-home-hub-avatar" aria-hidden>
                        {trainerName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="trainee-home-hub-copy">
                        <span className="trainee-home-hub-title">Open full dashboard</span>
                        <span className="trainee-home-hub-sub">Nutrition, templates, feedback, and more</span>
                    </div>
                    <ChevronRight className="trainee-home-hub-chevron" size={22} aria-hidden />
                </div>
            </button>

            <GoalsOverview activeTrainee={activeTrainee} />
            <WeeklyFeedback trainee={activeTrainee} />

            <TraineeHubOverlay
                open={hubOpen}
                onClose={() => setHubOpen(false)}
                activeTrainee={activeTrainee}
                trainerName={trainerName}
                onGoToWorkouts={() => onNavigate('workouts')}
                updateTrainee={updateTrainee}
            />
        </div>
    );
};
