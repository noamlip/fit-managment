import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import './CoachContextBar.scss';

export const CoachContextBar: React.FC = () => {
    const { userRole, trainerName, selectedTrainee, selectTrainee } = useConfig();
    const { trainees } = useTrainee();

    if (userRole !== 'coach') return null;

    const displayName = selectedTrainee ?? '';

    return (
        <div className="coach-context-bar" role="region" aria-label="Active trainee">
            <div className="coach-context-bar-inner">
                <span className="coach-context-bar-label" id="coach-active-trainee-label">
                    Active trainee
                </span>
                <select
                    className="coach-context-bar-select"
                    aria-labelledby="coach-active-trainee-label"
                    value={displayName}
                    title={selectedTrainee || undefined}
                    onChange={(e) => {
                        const v = e.target.value;
                        selectTrainee(v === '' ? null : v);
                    }}
                >
                    <option value="">No trainee selected</option>
                    {trainees.map((t) => (
                        <option key={t.id} value={t.name}>
                            {t.name.length > 40 ? `${t.name.slice(0, 37)}…` : t.name}
                        </option>
                    ))}
                </select>
                <span className="coach-context-bar-coach" title="Signed-in coach">
                    Coach: <strong>{trainerName}</strong>
                </span>
            </div>
        </div>
    );
};
