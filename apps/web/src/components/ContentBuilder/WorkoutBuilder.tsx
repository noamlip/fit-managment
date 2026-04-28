import { useState } from 'react';
import { X } from 'lucide-react';
import type { Exercise, ExerciseCatalog, WorkoutType } from '../../types';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import './WorkoutBuilder.scss';

interface Props {
    type: WorkoutType;
    exerciseCatalog: ExerciseCatalog;
    date: string;
    /** Shown after the em dash in the title instead of `date` when set */
    contextLabel?: string;
    onClose: () => void;
    onSave: (exercises: Exercise[]) => void;
    initialExercises: Exercise[];
}

export const WorkoutBuilder: React.FC<Props> = ({
    type,
    exerciseCatalog,
    date,
    contextLabel,
    onClose,
    onSave,
    initialExercises,
}) => {
    useEscapeToClose(onClose, true);

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

    const updatePlanned = (idx: number, patch: Partial<Exercise>) => {
        setPlanned((p) => p.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex)));
    };

    return (
        <div className="workout-builder-overlay">
            <div className="workout-builder-modal">
                <div className="wb-head">
                    <h2>
                        Build {type} — {contextLabel ?? date}
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
                        <h4 className="plan-heading">Workout plan</h4>
                        {planned.length === 0 ? (
                            <p className="plan-empty">Add exercises from the library.</p>
                        ) : (
                            planned.map((ex, idx) => (
                                <div key={ex.id} className="plan-row">
                                    <span className="plan-row-name" title={ex.name}>
                                        {ex.name}
                                    </span>
                                    <label className="plan-field plan-field-sets">
                                        <span className="visually-hidden">Sets</span>
                                        <input
                                            type="number"
                                            min={1}
                                            aria-label={`Sets for ${ex.name}`}
                                            value={ex.sets}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value, 10);
                                                updatePlanned(idx, {
                                                    sets: Number.isFinite(v) && v >= 1 ? v : 1,
                                                });
                                            }}
                                        />
                                    </label>
                                    <label className="plan-field plan-field-reps">
                                        <span className="visually-hidden">Reps</span>
                                        <input
                                            type="text"
                                            aria-label={`Reps for ${ex.name}`}
                                            value={ex.reps}
                                            onChange={(e) => updatePlanned(idx, { reps: e.target.value })}
                                        />
                                    </label>
                                    <label className="plan-field plan-field-rest">
                                        <span className="visually-hidden">Rest seconds</span>
                                        <input
                                            type="number"
                                            min={0}
                                            aria-label={`Rest in seconds for ${ex.name}`}
                                            value={ex.rest ?? 0}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value, 10);
                                                updatePlanned(idx, {
                                                    rest: Number.isFinite(v) && v >= 0 ? v : 0,
                                                });
                                            }}
                                        />
                                    </label>
                                    <button type="button" className="plan-row-remove" onClick={() => removeAt(idx)}>
                                        Remove
                                    </button>
                                    <div className="plan-row-extra">
                                        <label className="plan-field">
                                            <span className="visually-hidden">Exercise video URL</span>
                                            <input
                                                type="url"
                                                placeholder="Video URL (YouTube / MP4)"
                                                aria-label={`Video URL for ${ex.name}`}
                                                value={ex.videoUrl ?? ''}
                                                onChange={(e) => updatePlanned(idx, { videoUrl: e.target.value })}
                                            />
                                        </label>
                                        <label className="plan-field">
                                            <span className="visually-hidden">Exercise notes</span>
                                            <input
                                                type="text"
                                                placeholder="Exercise notes"
                                                aria-label={`Notes for ${ex.name}`}
                                                value={ex.notes ?? ''}
                                                onChange={(e) => updatePlanned(idx, { notes: e.target.value })}
                                            />
                                        </label>
                                    </div>
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
