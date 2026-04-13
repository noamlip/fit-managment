import { useState } from 'react';
import { X } from 'lucide-react';
import type { Exercise, ExerciseCatalog, WorkoutType } from '../../types';
import './WorkoutBuilder.scss';

interface Props {
    type: WorkoutType;
    exerciseCatalog: ExerciseCatalog;
    date: string;
    onClose: () => void;
    onSave: (exercises: Exercise[]) => void;
    initialExercises: Exercise[];
}

export const WorkoutBuilder: React.FC<Props> = ({
    type,
    exerciseCatalog,
    date,
    onClose,
    onSave,
    initialExercises,
}) => {
    const [planned, setPlanned] = useState<Exercise[]>(
        initialExercises.length > 0 ? [...initialExercises] : []
    );

    let seq = planned.length;
    const addFromCatalog = (name: string, bodyPart: string) => {
        seq += 1;
        setPlanned((p) => [
            ...p,
            {
                id: `e-${Date.now()}-${seq}`,
                name,
                sets: 3,
                reps: '8-12',
                rest: 90,
                bodyPart,
            },
        ]);
    };

    const removeAt = (idx: number) => {
        setPlanned((p) => p.filter((_, i) => i !== idx));
    };

    return (
        <div className="workout-builder-overlay">
            <div className="workout-builder-modal">
                <div className="wb-head">
                    <h2>
                        Build {type} — {date}
                    </h2>
                    <button type="button" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>
                <div className="wb-body">
                    <div className="catalog">
                        {Object.entries(exerciseCatalog).map(([part, names]) => (
                            <div key={part}>
                                <h4>{part}</h4>
                                {names.map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        className="cat-add"
                                        onClick={() => addFromCatalog(n, part)}
                                    >
                                        + {n}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="plan">
                        <h4 style={{ marginTop: 0, color: '#888' }}>Workout plan</h4>
                        {planned.length === 0 ? (
                            <p style={{ color: '#666' }}>Add exercises from the library.</p>
                        ) : (
                            planned.map((ex, idx) => (
                                <div key={ex.id} className="plan-row">
                                    <span>
                                        {ex.name} — {ex.sets}×{ex.reps}
                                    </span>
                                    <button type="button" onClick={() => removeAt(idx)}>
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="wb-actions">
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="save" onClick={() => onSave(planned)}>
                        Save workout
                    </button>
                </div>
            </div>
        </div>
    );
};
