import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import type {
    Exercise,
    LoggedExercise,
    LoggedSet,
    WorkoutSessionDraftCursor,
    WorkoutSessionLog,
} from '../../types';
import './WorkoutSessionModal.scss';

function findCursor(exercises: LoggedExercise[]): { exIdx: number; setNum: number } | null {
    for (let i = 0; i < exercises.length; i++) {
        if (exercises[i].sets.length < exercises[i].plannedSets) {
            return { exIdx: i, setNum: exercises[i].sets.length + 1 };
        }
    }
    return null;
}

function canResume(resume: WorkoutSessionLog, plan: Exercise[]): boolean {
    if (resume.endedAt) return false;
    if (resume.exercises.length !== plan.length) return false;
    return resume.exercises.every((le, i) => le.exerciseId === plan[i].id);
}

function formatClock(totalSec: number): string {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

interface WorkoutSessionModalProps {
    open: boolean;
    exercises: Exercise[];
    resumeLog?: WorkoutSessionLog | null;
    onCancel: () => void;
    onFinish: (log: WorkoutSessionLog) => void;
    onPersistDraft: (log: WorkoutSessionLog) => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
    open,
    exercises,
    resumeLog,
    onCancel,
    onFinish,
    onPersistDraft,
}) => {
    useEscapeToClose(onCancel, open);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [sessionLog, setSessionLog] = useState<WorkoutSessionLog>(() => ({
        startedAt: new Date().toISOString(),
        exercises: [],
        restExtensions: [],
    }));
    const [phase, setPhase] = useState<'work' | 'rest' | 'done'>('work');
    const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
    const [restRemainSec, setRestRemainSec] = useState(0);
    const [weightStr, setWeightStr] = useState('');
    const [repsStr, setRepsStr] = useState('');
    const initializedRef = useRef(false);
    const persistRef = useRef(onPersistDraft);
    persistRef.current = onPersistDraft;

    useEffect(() => {
        if (!open) return;
        const tick = () => {
            const t0 = new Date(sessionLog.startedAt).getTime();
            setElapsedSec(Math.max(0, Math.floor((Date.now() - t0) / 1000)));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [open, sessionLog.startedAt]);

    useEffect(() => {
        if (!open) {
            initializedRef.current = false;
            return;
        }
        if (initializedRef.current) return;
        initializedRef.current = true;

        if (resumeLog && canResume(resumeLog, exercises)) {
            const { draftCursor, ...rest } = resumeLog;
            const base: WorkoutSessionLog = { ...rest, draftCursor: undefined };
            setSessionLog(base);

            if (draftCursor?.phase === 'rest' && draftCursor.restEndsAt) {
                const end = new Date(draftCursor.restEndsAt).getTime();
                if (end > Date.now()) {
                    setPhase('rest');
                    setRestEndsAt(end);
                } else if (!findCursor(base.exercises)) {
                    setPhase('done');
                    setRestEndsAt(null);
                } else {
                    setPhase('work');
                    setRestEndsAt(null);
                }
            } else if (!findCursor(base.exercises)) {
                setPhase('done');
                setRestEndsAt(null);
            } else {
                setPhase('work');
                setRestEndsAt(null);
            }
        } else {
            setSessionLog({
                startedAt: new Date().toISOString(),
                exercises: exercises.map((ex) => ({
                    exerciseId: ex.id,
                    name: ex.name,
                    plannedSets: ex.sets,
                    sets: [],
                })),
                restExtensions: [],
            });
            setPhase('work');
            setRestEndsAt(null);
        }
    }, [open, exercises, resumeLog]);

    const cursor = findCursor(sessionLog.exercises);
    const currentExercise = cursor ? exercises[cursor.exIdx] : null;

    useEffect(() => {
        if (!open || phase !== 'work' || !currentExercise) return;
        setRepsStr(currentExercise.reps || '');
        setWeightStr('');
    }, [open, phase, cursor?.exIdx, cursor?.setNum, currentExercise]);

    useEffect(() => {
        if (phase !== 'rest' || !restEndsAt) {
            setRestRemainSec(0);
            return;
        }
        const update = () => {
            const rem = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
            setRestRemainSec(rem);
            if (Date.now() >= restEndsAt) {
                setPhase('work');
                setRestEndsAt(null);
            }
        };
        update();
        const id = setInterval(update, 250);
        return () => clearInterval(id);
    }, [phase, restEndsAt]);

    useEffect(() => {
        if (!open) return;
        if (exercises.length === 0) return;
        if (sessionLog.exercises.length !== exercises.length) return;

        if (phase === 'done') {
            persistRef.current({ ...sessionLog, draftCursor: undefined });
            return;
        }

        const c = findCursor(sessionLog.exercises);
        const last = sessionLog.exercises[sessionLog.exercises.length - 1];
        const draftCursor: WorkoutSessionDraftCursor = {
            exerciseIndex: c?.exIdx ?? Math.max(0, sessionLog.exercises.length - 1),
            setIndex: c?.setNum ?? (last ? last.plannedSets : 1),
            phase: phase === 'rest' ? 'rest' : 'work',
            restEndsAt:
                phase === 'rest' && restEndsAt ? new Date(restEndsAt).toISOString() : undefined,
        };
        persistRef.current({ ...sessionLog, draftCursor });
    }, [open, sessionLog, phase, restEndsAt, exercises.length]);

    const handleRequestClose = () => {
        if (window.confirm('Exit workout? In-progress data is saved as a draft; you can resume later.')) {
            onCancel();
        }
    };

    const handleCompleteSet = () => {
        if (!cursor || !currentExercise) return;

        const w = parseFloat(weightStr.replace(',', '.'));
        const newSet: LoggedSet = {
            setIndex: cursor.setNum,
            weightKg: Number.isFinite(w) && w >= 0 ? w : undefined,
            repsCompleted: repsStr.trim() || undefined,
        };

        const newExercises = sessionLog.exercises.map((le, i) =>
            i === cursor.exIdx ? { ...le, sets: [...le.sets, newSet] } : le
        );
        const nextLog: WorkoutSessionLog = { ...sessionLog, exercises: newExercises };
        setSessionLog(nextLog);

        const le = newExercises[cursor.exIdx];
        if (le.sets.length < le.plannedSets) {
            const restSec = currentExercise.rest ?? 90;
            setPhase('rest');
            setRestEndsAt(Date.now() + restSec * 1000);
        } else if (cursor.exIdx + 1 < newExercises.length) {
            setPhase('work');
            setRestEndsAt(null);
        } else {
            setPhase('done');
            setRestEndsAt(null);
        }
    };

    const addRestSeconds = (sec: number) => {
        if (!restEndsAt) return;
        setRestEndsAt((prev) => (prev ? prev + sec * 1000 : null));
        setSessionLog((prev) => {
            const t0 = new Date(prev.startedAt).getTime();
            const el = Math.max(0, Math.floor((Date.now() - t0) / 1000));
            return {
                ...prev,
                restExtensions: [...(prev.restExtensions || []), { atElapsedSeconds: el, addedSeconds: sec }],
            };
        });
    };

    const skipRest = () => {
        setPhase('work');
        setRestEndsAt(null);
    };

    const handleFinish = () => {
        const t0 = new Date(sessionLog.startedAt).getTime();
        const total = Math.max(0, Math.floor((Date.now() - t0) / 1000));
        onFinish({
            ...sessionLog,
            endedAt: new Date().toISOString(),
            totalElapsedSeconds: total,
            draftCursor: undefined,
        });
    };

    if (!open) return null;

    const totalSetsPlanned = sessionLog.exercises.reduce((acc, le) => acc + le.plannedSets, 0);
    const totalSetsDone = sessionLog.exercises.reduce((acc, le) => acc + le.sets.length, 0);

    const modal = (
        <div className="workout-session-modal">
            <div className="session-panel">
                <div className="session-head">
                    <div>
                        <h2>Workout session</h2>
                    </div>
                    <div className="timers">
                        <span className="elapsed-label">Elapsed</span>
                        <span className="elapsed">{formatClock(elapsedSec)}</span>
                    </div>
                    <div className="close-session">
                        <button type="button" onClick={handleRequestClose}>
                            Exit workout
                        </button>
                    </div>
                </div>

                <div className="session-body">
                    {phase === 'rest' && (
                        <div className="phase-rest">
                            <div className="rest-label">Rest</div>
                            <div className="rest-count">{restRemainSec}</div>
                            <div className="add-rest-btns">
                                <button type="button" onClick={() => addRestSeconds(30)}>
                                    +30s rest
                                </button>
                                <button type="button" onClick={() => addRestSeconds(60)}>
                                    +60s rest
                                </button>
                            </div>
                            <button type="button" className="skip-rest" onClick={skipRest}>
                                Skip rest
                            </button>
                        </div>
                    )}

                    {phase === 'work' && cursor && currentExercise && (
                        <div className="phase-work">
                            <h3 className="exercise-title">{currentExercise.name}</h3>
                            <p className="exercise-meta">
                                Set {cursor.setNum} of {sessionLog.exercises[cursor.exIdx].plannedSets}
                                {' · '}
                                Planned {currentExercise.reps} reps
                                {currentExercise.rest != null ? ` · ${currentExercise.rest}s rest` : ''}
                            </p>
                            <div className="field">
                                <label htmlFor="ws-weight">Actual weight (kg)</label>
                                <input
                                    id="ws-weight"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step={0.5}
                                    placeholder="e.g. 60"
                                    value={weightStr}
                                    onChange={(e) => setWeightStr(e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="ws-reps">Reps completed (optional)</label>
                                <input
                                    id="ws-reps"
                                    type="text"
                                    placeholder={currentExercise.reps}
                                    value={repsStr}
                                    onChange={(e) => setRepsStr(e.target.value)}
                                />
                            </div>
                            <button type="button" className="complete-set-btn" onClick={handleCompleteSet}>
                                Complete set
                            </button>
                        </div>
                    )}

                    {phase === 'done' && (
                        <div className="phase-done">
                            <p>All sets logged. Continue to daily feedback to complete your workout.</p>
                            <button type="button" className="finish-btn" onClick={handleFinish}>
                                Finish workout
                            </button>
                        </div>
                    )}

                    <div className="progress-hint">
                        Progress: {totalSetsDone} / {totalSetsPlanned} sets
                    </div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modal, document.body);
};
