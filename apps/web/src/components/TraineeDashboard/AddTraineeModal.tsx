import { useState } from 'react';
import { X } from 'lucide-react';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import { useTrainee } from '../../context/TraineeContext';
import type { TraineeGoals, TraineeMetrics } from '../../types';

interface Props {
    onClose: () => void;
}

const defaultMetrics: TraineeMetrics = {
    age: 30,
    height: 175,
    weight: 75,
    gender: 'male',
    activityLevel: 1.55,
};

const defaultGoals: TraineeGoals = {
    targetWeight: 72,
    dailyCalories: 2200,
    proteinTarget: 160,
    carbsTarget: 220,
    fatTarget: 65,
    waterTarget: 3000,
};

export const AddTraineeModal: React.FC<Props> = ({ onClose }) => {
    useEscapeToClose(onClose, true);
    const { addTrainee } = useTrainee();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [metrics, setMetrics] = useState<TraineeMetrics>({ ...defaultMetrics });
    const [goals] = useState<TraineeGoals>({ ...defaultGoals });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const n = name.trim();
        if (!n) return;
        addTrainee({
            name: n,
            email: email.trim() || undefined,
            startDate: new Date().toISOString().split('T')[0],
            metrics,
            goals,
            schedule: {},
            waterIntake: 0,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-trainee-modal" onClick={(ev) => ev.stopPropagation()}>
                <div className="modal-header-row">
                    <h3>Add trainee</h3>
                    <button type="button" className="icon-close" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>
                <form onSubmit={submit}>
                    <label>
                        Name
                        <input value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <label>
                        Email
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>
                    <div className="metrics-grid">
                        <label>
                            Age
                            <input
                                type="number"
                                value={metrics.age}
                                onChange={(e) => setMetrics({ ...metrics, age: +e.target.value })}
                            />
                        </label>
                        <label>
                            Height (cm)
                            <input
                                type="number"
                                value={metrics.height}
                                onChange={(e) => setMetrics({ ...metrics, height: +e.target.value })}
                            />
                        </label>
                        <label>
                            Weight (kg)
                            <input
                                type="number"
                                value={metrics.weight}
                                onChange={(e) => setMetrics({ ...metrics, weight: +e.target.value })}
                            />
                        </label>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
