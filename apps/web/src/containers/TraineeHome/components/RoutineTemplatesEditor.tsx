import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useWorkout } from '../../../context/WorkoutContext';
import { WorkoutBuilder } from '../../../components/ContentBuilder/WorkoutBuilder';
import { saveTraineeRoutines } from '../../../services/traineeRoutinesApi';
import type { Exercise, Trainee, WorkoutType } from '../../../types';
import './RoutineTemplatesEditor.scss';

const ROUTINE_TYPES: WorkoutType[] = ['push', 'pull', 'legs'];

function cloneExercises(list: Exercise[]): Exercise[] {
    return list.map((e) => ({ ...e }));
}

interface Props {
    trainee: Trainee;
    updateTrainee: (id: string, updates: Partial<Trainee>) => void;
    onEscapeLockChange?: (locked: boolean) => void;
}

export function RoutineTemplatesEditor({ trainee, updateTrainee, onEscapeLockChange }: Props) {
    const { exerciseCatalog, templates } = useWorkout();
    const { addToast } = useToast();
    const [selectedType, setSelectedType] = useState<WorkoutType>('push');
    const [showBuilder, setShowBuilder] = useState(false);
    const [copySourceOpen, setCopySourceOpen] = useState(false);

    useEffect(() => {
        onEscapeLockChange?.(showBuilder);
        return () => onEscapeLockChange?.(false);
    }, [showBuilder, onEscapeLockChange]);

    const currentList = useMemo(() => {
        const raw = trainee.routines?.[selectedType];
        return raw && raw.length > 0 ? raw : [];
    }, [trainee.routines, selectedType]);

    const defaultForType = useCallback(
        (type: WorkoutType) => templates.find((t) => t.type === type)?.exercises ?? [],
        [templates]
    );

    const persistFullRoutines = useCallback(
        async (nextRoutines: Record<string, Exercise[]>) => {
            updateTrainee(trainee.id, { routines: nextRoutines });
            try {
                await saveTraineeRoutines({ traineeId: trainee.id, routines: nextRoutines });
            } catch (err) {
                addToast(err instanceof Error ? err.message : 'Could not sync routines to server', 'error');
            }
        },
        [trainee.id, updateTrainee, addToast]
    );

    const handleBuilderSave = async (exercises: Exercise[]) => {
        const next = { ...(trainee.routines || {}), [selectedType]: exercises };
        await persistFullRoutines(next);
        setShowBuilder(false);
        addToast('Template saved', 'success');
    };

    const copyFromDefault = () => {
        const incoming = defaultForType(selectedType);
        if (incoming.length === 0) {
            addToast('No default template for this type', 'error');
            return;
        }
        if (currentList.length > 0 && !confirm('Replace current template with the default library template?')) return;
        const next = { ...(trainee.routines || {}), [selectedType]: cloneExercises(incoming) };
        void persistFullRoutines(next);
        addToast('Copied from default template', 'success');
    };

    const copyFromType = (source: WorkoutType) => {
        if (source === selectedType) return;
        const fromSaved = trainee.routines?.[source];
        const incoming =
            fromSaved && fromSaved.length > 0 ? cloneExercises(fromSaved) : cloneExercises(defaultForType(source));
        if (incoming.length === 0) {
            addToast('Source template is empty', 'error');
            return;
        }
        if (currentList.length > 0 && !confirm(`Replace current ${selectedType} template with a copy from ${source}?`)) {
            return;
        }
        const next = { ...(trainee.routines || {}), [selectedType]: incoming };
        void persistFullRoutines(next);
        setCopySourceOpen(false);
        addToast(`Copied from ${source}`, 'success');
    };

    return (
        <div className="routine-templates-editor">
            <p className="rte-hint">
                Save exercise lists per workout type. They apply on scheduled days when your coach has not set custom
                exercises for that day.
            </p>

            <div className="rte-type-tabs">
                {ROUTINE_TYPES.map((t) => (
                    <button
                        key={t}
                        type="button"
                        className={selectedType === t ? 'active' : ''}
                        onClick={() => setSelectedType(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="rte-actions">
                <button type="button" className="rte-btn primary" onClick={() => setShowBuilder(true)}>
                    Edit template
                </button>
                <button type="button" className="rte-btn" onClick={copyFromDefault}>
                    Copy from default
                </button>
                <div className="rte-copy-wrap">
                    <button type="button" className="rte-btn" onClick={() => setCopySourceOpen((o) => !o)}>
                        Copy from type…
                    </button>
                    {copySourceOpen && (
                        <div className="rte-copy-menu">
                            {ROUTINE_TYPES.filter((t) => t !== selectedType).map((t) => (
                                <button key={t} type="button" onClick={() => copyFromType(t)}>
                                    From {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="rte-preview">
                <h4>Current {selectedType} template</h4>
                {currentList.length === 0 ? (
                    <p className="rte-empty">No exercises yet — edit or copy from default.</p>
                ) : (
                    <ul>
                        {currentList.map((ex) => (
                            <li key={ex.id}>
                                {ex.name} — {ex.sets}×{ex.reps}
                                {ex.rest != null ? ` (${ex.rest}s rest)` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showBuilder && (
                <WorkoutBuilder
                    key={selectedType}
                    type={selectedType}
                    exerciseCatalog={exerciseCatalog}
                    date="saved template"
                    contextLabel="Saved template"
                    onClose={() => setShowBuilder(false)}
                    onSave={(ex) => void handleBuilderSave(ex)}
                    initialExercises={currentList.length > 0 ? cloneExercises(currentList) : cloneExercises(defaultForType(selectedType))}
                />
            )}
        </div>
    );
}
