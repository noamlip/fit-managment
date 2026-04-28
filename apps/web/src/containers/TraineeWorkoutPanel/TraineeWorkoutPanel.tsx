import { useMemo, useState, useCallback, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useToast } from '../../context/ToastContext';
import { useWorkoutFeedbackConfig } from '../../hooks/useWorkoutFeedbackConfig';
import { WorkoutSessionModal } from '../../components/TraineeWorkoutPanel/WorkoutSessionModal';
import type { DailyWorkout, Exercise, FeedbackAnswers, WorkoutSessionLog } from '../../types';
import { serializeFeedbackForStorage } from '../../lib/serializeFeedback';
import { TodaysWorkout } from '../../components/TraineeWorkoutPanel/TodaysWorkout';
import { WeekStrip } from '../../components/TraineeWorkoutPanel/WeekStrip';
import { CoachWorkoutHistory } from '../../components/TraineeWorkoutPanel/CoachWorkoutHistory';
import './TraineeWorkoutPanel.scss';

interface WeekDayInfo {
    date: Date;
    name: string;
    day: number;
    isToday: boolean;
    workout: string;
    type: string;
    isDone: boolean;
}

export const TraineeWorkoutPanel: React.FC = () => {
    const { trainerName, userRole, selectedTrainee } = useConfig();
    const { trainees, updateTrainee } = useTrainee();
    const { templates } = useWorkout();
    const { addToast } = useToast();
    const { questions } = useWorkoutFeedbackConfig();

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [coachHistoryDate, setCoachHistoryDate] = useState<string | null>(null);
    const [exerciseVideoMap, setExerciseVideoMap] = useState<Record<string, string>>({});
    const normalizeExerciseName = (name: string): string =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();

    const subjectName = userRole === 'coach' ? selectedTrainee : trainerName;
    const activeTrainee = useMemo(
        () => (subjectName ? trainees.find((t) => t.name === subjectName) : undefined),
        [trainees, subjectName]
    );

    useEffect(() => {
        setCoachHistoryDate(null);
    }, [activeTrainee?.id, userRole]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/data/exercise-videos/videos.json');
                if (!res.ok) return;
                const raw = (await res.json()) as Record<string, unknown>;
                if (cancelled) return;
                const next: Record<string, string> = {};
                for (const [name, url] of Object.entries(raw)) {
                    if (typeof url === 'string' && url.trim()) {
                        next[normalizeExerciseName(name)] = url;
                    }
                }
                setExerciseVideoMap(next);
            } catch {
                // optional config file: ignore when missing
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSchedule = activeTrainee?.schedule?.[todayStr];
    const isCompleted = todaysSchedule?.status === 'completed';

    const planExercises: Exercise[] = useMemo(() => {
        if (!todaysSchedule || todaysSchedule.workoutType === 'rest') return [];
        const template = templates.find((t) => t.type === todaysSchedule.workoutType);
        const enrichVideo = (items: Exercise[]): Exercise[] =>
            items.map((ex) => ({
                ...ex,
                videoUrl: ex.videoUrl || exerciseVideoMap[normalizeExerciseName(ex.name)],
            }));
        if (todaysSchedule.exercises && todaysSchedule.exercises.length > 0) {
            return enrichVideo(todaysSchedule.exercises);
        }
        const fromRoutines = activeTrainee?.routines?.[todaysSchedule.workoutType];
        if (fromRoutines && fromRoutines.length > 0) {
            return enrichVideo(fromRoutines);
        }
        return enrichVideo(template?.exercises || []);
    }, [todaysSchedule, templates, activeTrainee?.routines, exerciseVideoMap]);

    useEffect(() => {
        if (!showSessionModal || planExercises.length === 0) return;
        // Debug only: verify video mapping per exercise in browser console.
        console.groupCollapsed('[Workout video mapping]');
        for (const ex of planExercises) {
            console.log({
                exerciseName: ex.name,
                hasDirectVideoUrl: Boolean(ex.videoUrl),
                mappedFromJson: Boolean(exerciseVideoMap[normalizeExerciseName(ex.name)]),
                resolvedVideoUrl: ex.videoUrl || null,
            });
        }
        console.groupEnd();
    }, [showSessionModal, planExercises, exerciseVideoMap]);

    const resumeLog = useMemo(() => {
        const log = todaysSchedule?.sessionLog;
        if (!log || log.endedAt) return null;
        return log;
    }, [todaysSchedule?.sessionLog]);

    const persistSessionDraft = useCallback(
        (log: WorkoutSessionLog) => {
            if (!activeTrainee) return;
            const base: DailyWorkout = todaysSchedule || {
                workoutType: planExercises.length ? 'other' : 'rest',
                status: 'pending',
            };
            updateTrainee(activeTrainee.id, {
                schedule: {
                    ...(activeTrainee.schedule || {}),
                    [todayStr]: {
                        ...base,
                        exercises: base.exercises?.length ? base.exercises : planExercises,
                        sessionLog: { ...log },
                    },
                },
            });
        },
        [activeTrainee, todaysSchedule, todayStr, planExercises, updateTrainee]
    );

    const handleFeedbackSubmit = useCallback((answers: FeedbackAnswers, logOverride?: WorkoutSessionLog) => {
        const missing = questions.some((q) => q.required && (answers[q.id] === undefined || answers[q.id] === ''));
        if (missing) {
            addToast('Please answer all questions before submitting.', 'error');
            return;
        }
        if (!activeTrainee) return;

        const persistedFeedback = serializeFeedbackForStorage(answers);

        const nextSchedule: Record<string, DailyWorkout> = {
            ...(activeTrainee.schedule || {}),
            [todayStr]: {
                ...(todaysSchedule || { workoutType: 'other', status: 'pending' }),
                status: 'completed',
                feedback: persistedFeedback,
                sessionLog: logOverride ?? todaysSchedule?.sessionLog,
            },
        };

        updateTrainee(activeTrainee.id, {
            schedule: nextSchedule,
            lastWorkoutDate: todayStr,
        });
        addToast(isCompleted ? 'Daily feedback updated!' : 'Great job! Workout complete.', 'success');
    }, [questions, addToast, activeTrainee, todaysSchedule, todayStr, updateTrainee, isCompleted]);

    const weekDays = useMemo((): WeekDayInfo[] => {
        const curr = new Date();
        const day = curr.getDay();
        const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(curr);
        monday.setDate(diff);

        return Array.from({ length: 7 }, (_, i) => {
            const next = new Date(monday);
            next.setDate(monday.getDate() + i);
            const dateStr = next.toISOString().split('T')[0];
            const scheduled = activeTrainee?.schedule?.[dateStr];
            const workoutType = scheduled?.workoutType || 'rest';

            return {
                date: next,
                name: next.toLocaleDateString('en-US', { weekday: 'short' }),
                day: next.getDate(),
                isToday: next.toDateString() === new Date().toDateString(),
                workout:
                    workoutType !== 'rest'
                        ? workoutType.charAt(0).toUpperCase() + workoutType.slice(1)
                        : 'Rest',
                type: workoutType,
                isDone: scheduled?.status === 'completed',
            };
        });
    }, [activeTrainee]);

    const initialAnswers: FeedbackAnswers = useMemo(() => {
        if (todaysSchedule?.status === 'completed' && todaysSchedule.feedback) {
            return { ...todaysSchedule.feedback } as FeedbackAnswers;
        }
        return {};
    }, [todaysSchedule]);

    const onStartWorkout = () => {
        if (isCompleted) {
            addToast('Workout already completed for today.', 'info');
            return;
        }
        if (planExercises.length === 0) {
            addToast('No exercises scheduled for today.', 'warning');
            return;
        }
        setShowSessionModal(true);
    };

    const handleSessionFinish = (log: WorkoutSessionLog, answers: FeedbackAnswers) => {
        handleFeedbackSubmit(answers, log);
        setShowSessionModal(false);
    };

    const handleSessionCancel = () => {
        setShowSessionModal(false);
    };

    const handleSessionDiscard = () => {
        if (!activeTrainee) return;
        const base: DailyWorkout = todaysSchedule || { workoutType: planExercises[0] ? 'other' : 'rest', status: 'pending' };
        updateTrainee(activeTrainee.id, {
            schedule: {
                ...(activeTrainee.schedule || {}),
                [todayStr]: {
                    ...base,
                    exercises: base.exercises?.length ? base.exercises : planExercises,
                    sessionLog: undefined,
                },
            },
        });
        setShowSessionModal(false);
        addToast('Workout draft removed.', 'info');
    };

    return (
        <div className="trainee-workout-panel">
            {showSessionModal && (
                <WorkoutSessionModal
                    open={showSessionModal}
                    exercises={planExercises}
                    isTraineeReadOnly={userRole === 'trainer'}
                    resumeLog={resumeLog}
                    previousCompletedLog={
                        Object.entries(activeTrainee?.schedule || {})
                            .filter(([date, day]) => {
                                if (date >= todayStr) return false;
                                if (!day.sessionLog?.endedAt) return false;
                                if (!todaysSchedule || day.workoutType === 'rest' || todaysSchedule.workoutType === 'rest') {
                                    return false;
                                }
                                return day.workoutType === todaysSchedule.workoutType;
                            })
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([, day]) => day.sessionLog)
                            .find((log): log is WorkoutSessionLog => Boolean(log)) || null
                    }
                    feedbackQuestions={questions}
                    initialFeedback={initialAnswers}
                    onCancel={handleSessionCancel}
                    onDiscardDraft={handleSessionDiscard}
                    onFinish={handleSessionFinish}
                    onPersistDraft={persistSessionDraft}
                />
            )}
            <header className="panel-header">
                <div className="welcome">
                    {userRole === 'coach' ? (
                        <p className="panel-subtitle coach-workouts-subtitle">
                            Use workout history below for any date range, then the week strip and today&apos;s session
                            (same view the trainee sees).
                        </p>
                    ) : (
                        <>
                            <h1>Hello, {trainerName}</h1>
                            <p>Ready to crush your goals today?</p>
                        </>
                    )}
                </div>
            </header>


            <WeekStrip days={weekDays} />

            <div className="todays-workout-card">
                <TodaysWorkout
                    schedule={todaysSchedule}
                    templates={templates}
                    exercisesForToday={planExercises}
                    isCompleted={isCompleted}
                    hasDraft={Boolean(resumeLog)}
                    onStart={onStartWorkout}
                    />
            </div>
            {userRole === 'coach' && activeTrainee && (
                <CoachWorkoutHistory
                    trainee={activeTrainee}
                    selectedDetailDate={coachHistoryDate}
                    onSelectDetailDate={setCoachHistoryDate}
                />
            )}
        </div>
    );
};
