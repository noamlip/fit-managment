import type { AppPage } from '../Layout/Layout';
import './CoachNeedsTraineePlaceholder.scss';

interface Props {
    page: 'nutrition' | 'workouts';
    onNavigate: (page: AppPage) => void;
}

export const CoachNeedsTraineePlaceholder: React.FC<Props> = ({ page, onNavigate }) => {
    return (
        <div className="coach-needs-trainee">
            <h2 className="coach-needs-trainee-title">Select a trainee</h2>
            <p className="coach-needs-trainee-text">
                Choose someone in the <strong>Active trainee</strong> dropdown in the bar above, or go to{' '}
                <strong>Trainees</strong> and click a card. Then open{' '}
                <strong>{page === 'nutrition' ? 'Nutrition' : 'Workouts'}</strong> for that person.
            </p>
            <button type="button" className="coach-needs-trainee-btn" onClick={() => onNavigate('home')}>
                Go to Trainees
            </button>
        </div>
    );
};
