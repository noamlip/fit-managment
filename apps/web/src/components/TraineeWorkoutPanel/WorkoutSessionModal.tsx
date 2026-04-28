import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Play } from 'lucide-react';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import type { Exercise, FeedbackAnswers, FeedbackQuestion, WorkoutSessionLog } from '../../types';
import './WorkoutSessionModal.scss';

function formatClock(totalSec: number): string {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function canResume(resume: WorkoutSessionLog, plan: Exercise[]): boolean {
    if (resume.endedAt) return false;
    if (resume.exercises.length !== plan.length) return false;
    return resume.exercises.every((le, i) => le.exerciseId === plan[i].id);
}

function toEmbedUrl(url: string): string {
    if (url.includes('youtube.com/watch?v=')) {
        const id = new URL(url).searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    return url;
}

interface SetEntry {
    weight: string;
    reps: string;
}

function parseTargetReps(text: string): number {
    const direct = Number.parseFloat(text.replace(',', '.'));
    if (Number.isFinite(direct)) return direct;
    const first = text.match(/\d+(\.\d+)?/);
    return first ? Number.parseFloat(first[0]) : 0;
}

interface ExerciseEntry {
    notes: string;
    sets: SetEntry[];
}

interface WorkoutSessionModalProps {
    open: boolean;
    exercises: Exercise[];
    isTraineeReadOnly: boolean;
    resumeLog?: WorkoutSessionLog | null;
    previousCompletedLog?: WorkoutSessionLog | null;
    feedbackQuestions: FeedbackQuestion[];
    initialFeedback: FeedbackAnswers;
    onCancel: () => void;
    onDiscardDraft: () => void;
    onFinish: (log: WorkoutSessionLog, answers: FeedbackAnswers) => void;
    onPersistDraft: (log: WorkoutSessionLog) => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
    open,
    exercises,
    isTraineeReadOnly,
    resumeLog,
    previousCompletedLog,
    feedbackQuestions,
    initialFeedback,
    onCancel,
    onDiscardDraft,
    onFinish,
    onPersistDraft,
}) => {
    const initializedRef = useRef(false);
    const [startedAt, setStartedAt] = useState(new Date().toISOString());
    const [elapsedSec, setElapsedSec] = useState(0);
    const [entries, setEntries] = useState<ExerciseEntry[]>([]);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [showVideoUrl, setShowVideoUrl] = useState<string | null>(null);
    const [restRemainSec, setRestRemainSec] = useState(0);
    const [stage, setStage] = useState<'log' | 'review'>('log');
    const [feedback, setFeedback] = useState<FeedbackAnswers>({});

    useEffect(() => {
        if (!open) {
            initializedRef.current = false;
            setStage('log');
            setShowVideoUrl(null);
            setShowExitPopup(false);
            return;
        }
        if (initializedRef.current) return;
        initializedRef.current = true;

        if (resumeLog && canResume(resumeLog, exercises)) {
            setStartedAt(resumeLog.startedAt);
            setEntries(
                exercises.map((exercise, exIdx) => {
                    const resumed = resumeLog.exercises[exIdx];
                    const sets = Array.from({ length: exercise.sets }, (_, setIdx) => {
                        const existing = resumed?.sets.find((s) => s.setIndex === setIdx + 1);
                        return {
                            weight: existing?.weightKg != null ? String(existing.weightKg) : '',
                            reps: existing?.repsCompleted ?? exercise.reps,
                        };
                    });
                    return { notes: resumed?.notes ?? exercise.notes ?? '', sets };
                })
            );
        } else {
            setStartedAt(new Date().toISOString());
            setEntries(
                exercises.map((exercise) => ({
                    notes: exercise.notes ?? '',
                    sets: Array.from({ length: exercise.sets }, () => ({ weight: '', reps: exercise.reps })),
                }))
            );
        }
        setFeedback({ ...initialFeedback });
    }, [open, exercises, resumeLog, initialFeedback]);

    useEffect(() => {
        if (!open) return;
        const tick = () => {
            const t0 = new Date(startedAt).getTime();
            setElapsedSec(Math.max(0, Math.floor((Date.now() - t0) / 1000)));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [open, startedAt]);

    useEffect(() => {
        if (restRemainSec <= 0) return;
        const id = setInterval(() => setRestRemainSec((prev) => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(id);
    }, [restRemainSec]);

    const buildLog = (finalized: boolean): WorkoutSessionLog => {
        const log: WorkoutSessionLog = {
            startedAt,
            exercises: exercises.map((exercise, exIdx) => {
                const exEntry = entries[exIdx];
                return {
                    exerciseId: exercise.id,
                    name: exercise.name,
                    plannedSets: exercise.sets,
                    notes: exEntry?.notes || undefined,
                    sets:
                        exEntry?.sets
                            .map((set, setIdx) => {
                                const w = Number.parseFloat(set.weight.replace(',', '.'));
                                const hasWeight = Number.isFinite(w) && w >= 0;
                                if (!hasWeight) return null;
                                const repsText = isTraineeReadOnly ? exercise.reps : set.reps.trim();
                                return {
                                    setIndex: setIdx + 1,
                                    weightKg: hasWeight ? w : undefined,
                                    repsCompleted: repsText || exercise.reps,
                                };
                            })
                            .filter((s): s is NonNullable<typeof s> => Boolean(s)) ?? [],
                };
            }),
            restExtensions: [],
        };
        if (finalized) {
            log.endedAt = new Date().toISOString();
            log.totalElapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
        } else {
            log.draftCursor = { exerciseIndex: 0, setIndex: 1, phase: 'work' };
        }
        return log;
    };

    const previousSetMap = useMemo(() => {
        const map = new Map<string, { weight?: number; reps?: string; volume: number }>();
        if (!previousCompletedLog) return map;
        for (const ex of previousCompletedLog.exercises) {
            for (const set of ex.sets) {
                const reps = Number.parseFloat((set.repsCompleted || '').replace(',', '.'));
                const volume = (set.weightKg ?? 0) * (Number.isFinite(reps) ? reps : 0);
                map.set(`${ex.exerciseId}:${set.setIndex}`, { weight: set.weightKg, reps: set.repsCompleted, volume });
            }
        }
        return map;
    }, [previousCompletedLog]);

    const personalRecords = useMemo(() => {
        const prs: Array<{ label: string; oldVolume: number; newVolume: number }> = [];
        for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
            const ex = exercises[exIdx];
            const rows = entries[exIdx]?.sets || [];
            for (let setIdx = 0; setIdx < rows.length; setIdx++) {
                const row = rows[setIdx];
                const w = Number.parseFloat(row.weight.replace(',', '.'));
                const r = parseTargetReps(isTraineeReadOnly ? ex.reps : row.reps);
                if (!Number.isFinite(w) || !Number.isFinite(r)) continue;
                const newVolume = w * r;
                const oldVolume = previousSetMap.get(`${ex.id}:${setIdx + 1}`)?.volume ?? 0;
                if (newVolume > oldVolume) {
                    prs.push({
                        label: `${ex.name} · Set ${setIdx + 1}`,
                        oldVolume,
                        newVolume,
                    });
                }
            }
        }
        return prs;
    }, [entries, exercises, previousSetMap]);

    const setEntry = (exIdx: number, setIdx: number, patch: Partial<SetEntry>) => {
        setEntries((prev) => {
            const next = prev.map((entry) => ({ ...entry, sets: entry.sets.map((row) => ({ ...row })) }));
            const before = next[exIdx].sets[setIdx];
            const wasFilled = before.weight.trim().length > 0 || before.reps.trim().length > 0;
            next[exIdx].sets[setIdx] = { ...before, ...patch };
            const after = next[exIdx].sets[setIdx];
            const nowFilled = after.weight.trim().length > 0 && after.reps.trim().length > 0;
            if (!wasFilled && nowFilled) {
                setRestRemainSec(exercises[exIdx]?.rest ?? 0);
            }
            return next;
        });
    };

    const setNotes = (exIdx: number, notes: string) => {
        setEntries((prev) => prev.map((entry, i) => (i === exIdx ? { ...entry, notes } : entry)));
    };

    const handleSaveDraftAndExit = () => {
        onPersistDraft(buildLog(false));
        setShowExitPopup(false);
        onCancel();
    };
    const handleDiscardAndExit = () => {
        setShowExitPopup(false);
        onDiscardDraft();
    };
    const handleRequestClose = () => setShowExitPopup(true);
    const handleMoveToReview = () => setStage('review');
    const handleSaveWorkout = () => onFinish(buildLog(true), feedback);

    const updateFeedback = (id: string, v: string | number) => {
        setFeedback((prev) => ({ ...prev, [id]: v }));
    };

    useEscapeToClose(() => {
        if (showVideoUrl) {
            setShowVideoUrl(null);
            return;
        }
        if (showExitPopup) {
            setShowExitPopup(false);
            return;
        }
        handleRequestClose();
    }, open);

    if (!open) return null;

    const modal = (
        <div className="workout-session-modal">
            <div className="session-panel">
                <div className="session-head">
                    <h2>Workout session</h2>
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

                {restRemainSec > 0 && (
                    <div className="rest-banner">
                        Rest timer: {restRemainSec}s
                    </div>
                )}

                <div className="session-body">
                    {stage === 'log' ? (
                        <div className="exercise-plan">
                            {exercises.map((exercise, exIdx) => (
                                <div key={exercise.id} className="exercise-item">
                                    <div className="exercise-top">
                                        <button
                                            type="button"
                                            className="video-btn"
                                            onClick={() => exercise.videoUrl && setShowVideoUrl(exercise.videoUrl)}
                                            disabled={!exercise.videoUrl}
                                        >
                                            <Play size={16} />
                                            Video
                                        </button>
                                        <div className="exercise-main">{exercise.name}</div>
                                    </div>
                                    <textarea
                                        className="exercise-notes"
                                        value={entries[exIdx]?.notes ?? exercise.notes ?? ''}
                                        readOnly={isTraineeReadOnly}
                                        onChange={(e) => setNotes(exIdx, e.target.value)}
                                    />
                                    <div className="sets-grid-head">
                                        <span>Weight (kg)</span>
                                        <span>{isTraineeReadOnly ? 'Target reps' : 'Reps'}</span>
                                    </div>
                                    {Array.from({ length: exercise.sets }, (_, setIdx) => {
                                        const current = entries[exIdx]?.sets[setIdx] ?? { weight: '', reps: exercise.reps };
                                        const prev = previousSetMap.get(`${exercise.id}:${setIdx + 1}`);
                                        return (
                                            <div key={`${exercise.id}-${setIdx}`} className="set-row">
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={0}
                                                    placeholder={prev?.weight != null ? String(prev.weight) : '0'}
                                                    value={current.weight}
                                                    onChange={(e) => setEntry(exIdx, setIdx, { weight: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    value={isTraineeReadOnly ? exercise.reps : current.reps}
                                                    readOnly={isTraineeReadOnly}
                                                    onChange={(e) => setEntry(exIdx, setIdx, { reps: e.target.value })}
                                                />
                                                {isTraineeReadOnly && (
                                                    <div className="previous-row">
                                                        Prev: {prev?.weight != null ? `${prev.weight}kg` : '-'} x {prev?.reps || '-'}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            <div className="phase-done">
                                <button type="button" className="save-draft-btn" onClick={handleSaveDraftAndExit}>
                                    Save draft and exit
                                </button>
                                <button type="button" className="finish-btn" onClick={handleMoveToReview}>
                                    Finish workout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="review-stage">
                            <h3>Session summary</h3>
                            {personalRecords.length === 0 ? (
                                <p className="review-muted">No new volume PR this session.</p>
                            ) : (
                                <div className="pr-list">
                                    {personalRecords.map((pr) => (
                                        <div key={pr.label} className="pr-row">
                                            <span>{pr.label}</span>
                                            <strong>{Math.round(pr.oldVolume)} → {Math.round(pr.newVolume)}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3>Workout feedback</h3>
                            {feedbackQuestions.map((q) => (
                                <div key={q.id} className="feedback-row">
                                    <label htmlFor={`fb-${q.id}`}>{q.text}{q.required ? ' *' : ''}</label>
                                    {q.type === 'text' ? (
                                        <textarea
                                            id={`fb-${q.id}`}
                                            rows={3}
                                            value={String(feedback[q.id] ?? '')}
                                            onChange={(e) => updateFeedback(q.id, e.target.value)}
                                        />
                                    ) : q.type === 'number' ? (
                                        <input
                                            id={`fb-${q.id}`}
                                            type="number"
                                            value={String(feedback[q.id] ?? '')}
                                            onChange={(e) => updateFeedback(q.id, Number(e.target.value))}
                                        />
                                    ) : (
                                        <input
                                            id={`fb-${q.id}`}
                                            type="range"
                                            min={q.config?.min ?? 1}
                                            max={q.config?.max ?? 10}
                                            value={Number(feedback[q.id] ?? q.config?.min ?? 1)}
                                            onChange={(e) => updateFeedback(q.id, Number(e.target.value))}
                                        />
                                    )}
                                </div>
                            ))}
                            <button type="button" className="finish-btn" onClick={handleSaveWorkout}>
                                Save workout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showExitPopup && (
                <div className="exit-popup-backdrop" role="presentation">
                    <div className="exit-popup" role="dialog" aria-modal="true" aria-label="Exit workout options">
                        <h3>Exit workout?</h3>
                        <p>Choose how you want to leave this session.</p>
                        <button type="button" className="save" onClick={handleSaveDraftAndExit}>
                            Save as draft and exit
                        </button>
                        <button type="button" className="delete" onClick={handleDiscardAndExit}>
                            Delete draft and exit
                        </button>
                        <button type="button" className="cancel" onClick={() => setShowExitPopup(false)}>
                            Stay in workout
                        </button>
                    </div>
                </div>
            )}

            {showVideoUrl && (
                <div className="video-fullscreen" role="dialog" aria-modal="true">
                    <button type="button" className="video-close" onClick={() => setShowVideoUrl(null)}>
                        Close
                    </button>
                    {showVideoUrl.includes('youtube.com') || showVideoUrl.includes('youtu.be') ? (
                        <iframe src={toEmbedUrl(showVideoUrl)} title="Exercise video" allowFullScreen />
                    ) : (
                        <video src={showVideoUrl} controls autoPlay playsInline />
                    )}
                </div>
            )}
        </div>
    );

    return ReactDOM.createPortal(modal, document.body);
};
