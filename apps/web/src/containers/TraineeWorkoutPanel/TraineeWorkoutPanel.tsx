import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useToast } from '../../context/ToastContext';
import { useWorkoutFeedbackConfig } from '../../hooks/useWorkoutFeedbackConfig';
import { FeedbackModal } from '../../components/TraineeWorkoutPanel/FeedbackModal';
import { WorkoutSessionModal } from '../../components/TraineeWorkoutPanel/WorkoutSessionModal';
import type { DailyWorkout, Exercise, FeedbackAnswers, WorkoutSessionLog } from '../../types';
import { serializeFeedbackForStorage } from '../../lib/serializeFeedback';
import { debounce } from '../../lib/debounce';
import { TodaysWorkout } from '../../components/TraineeWorkoutPanel/TodaysWorkout';
import { WeekStrip } from '../../components/TraineeWorkoutPanel/WeekStrip';
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
    const { trainerName } = useConfig();
    const { trainees, updateTrainee } = useTrainee();
    const { templates } = useWorkout();
    const { addToast } = useToast();
    const { questions } = useWorkoutFeedbackConfig();

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const sessionLogRef = useRef<WorkoutSessionLog | null>(null);
    const activeTrainee = useMemo(() => trainees.find((t) => t.name === trainerName), [trainees, trainerName]);
    const activeTraineeRef = useRef(activeTrainee);
    activeTraineeRef.current = activeTrainee;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSchedule = activeTrainee?.schedule?.[todayStr];
    const isCompleted = todaysSchedule?.status === 'completed';

    const planExercises: Exercise[] = useMemo(() => {
        if (!todaysSchedule || todaysSchedule.workoutType === 'rest') return [];
        const template = templates.find((t) => t.type === todaysSchedule.workoutType);
        return todaysSchedule.exercises?.length
            ? todaysSchedule.exercises
            : template?.exercises ?? [];
    }, [todaysSchedule, templates]);

    const debouncedPersistDraft = useMemo(
        () =>
            debounce((log: WorkoutSessionLog) => {
                const t = activeTraineeRef.current;
                if (!t) return;
                const day = t.schedule?.[todayStr];
                updateTrainee(t.id, {
                    schedule: {
                        ...t.schedule,
                        [todayStr]: {
                            ...(day || { workoutType: 'other', status: 'pending' }),
                            sessionLog: log,
                        },
                    },
                });
            }, 800),
        [updateTrainee, todayStr]
    );

    useEffect(() => {
        return () => {
            debouncedPersistDraft.cancel();
        };
    }, [debouncedPersistDraft]);

    const handlePersistDraft = useCallback(
        (log: WorkoutSessionLog) => {
            debouncedPersistDraft(log);
        },
        [debouncedPersistDraft]
    );

    const handleStartClick = () => {
        if (isCompleted) {
            setShowFeedbackModal(true);
            return;
        }
        if (todaysSchedule?.sessionLog?.endedAt && todaysSchedule.status === 'pending') {
            setShowFeedbackModal(true);
            return;
        }
        if (planExercises.length === 0) {
            addToast('No exercises in today’s workout. Ask your coach to assign exercises.', 'info');
            return;
        }
        setShowSessionModal(true);
    };

    const handleSessionFinish = (log: WorkoutSessionLog) => {
        debouncedPersistDraft.cancel();
        sessionLogRef.current = log;
        const t = activeTraineeRef.current;
        if (!t) return;
        const day = t.schedule?.[todayStr];
        updateTrainee(t.id, {
            schedule: {
                ...t.schedule,
                [todayStr]: {
                    ...(day || { workoutType: 'other', status: 'pending' }),
                    sessionLog: log,
                },
            },
        });
        setShowSessionModal(false);
        setShowFeedbackModal(true);
    };

    const handleSessionCancel = () => {
        debouncedPersistDraft.flush();
        setShowSessionModal(false);
    };

    const handleFeedbackSubmit = (answers: FeedbackAnswers) => {
        const missing = questions.some((q) => q.required && (answers[q.id] === undefined || answers[q.id] === ''));
        if (missing) {
            addToast('Please answer all questions before submitting.', 'error');
            return;
        }
        const t = activeTraineeRef.current;
        if (!t) return;

        const persistedFeedback = serializeFeedbackForStorage(answers);
        const day = t.schedule?.[todayStr] ?? todaysSchedule;

        const nextSchedule: Record<string, DailyWorkout> = {
            ...(t.schedule || {}),
            [todayStr]: {
                ...(day || { workoutType: 'other', status: 'pending' }),
                status: 'completed',
                feedback: persistedFeedback,
                sessionLog: sessionLogRef.current ?? day?.sessionLog,
            },
        };

        updateTrainee(t.id, {
            schedule: nextSchedule,
            lastWorkoutDate: todayStr,
        });
        sessionLogRef.current = null;
        setShowFeedbackModal(false);
        addToast(isCompleted ? 'Daily feedback updated!' : 'Great job! Workout complete.', 'success');
    };

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

    const resumeLog =
        todaysSchedule?.sessionLog && !todaysSchedule.sessionLog.endedAt
            ? todaysSchedule.sessionLog
            : null;

    return (
        <div className="trainee-workout-panel">
            {showSessionModal && (
                <WorkoutSessionModal
                    open={showSessionModal}
                    exercises={planExercises}
                    resumeLog={resumeLog}
                    onCancel={handleSessionCancel}
                    onFinish={handleSessionFinish}
                    onPersistDraft={handlePersistDraft}
                />
            )}
            {showFeedbackModal && (
                <FeedbackModal
                    isCompleted={isCompleted}
                    questions={questions}
                    initialAnswers={initialAnswers}
                    onSubmit={handleFeedbackSubmit}
                    onCancel={() => setShowFeedbackModal(false)}
                />
            )}
            <header className="panel-header">
                <div className="welcome">
                    <h1>Hello, {trainerName}</h1>
                    <p>Ready to crush your goals today?</p>
                </div>
            </header>

            <WeekStrip days={weekDays} />

            <div className="todays-workout-card">
                <TodaysWorkout
                    schedule={todaysSchedule}
                    templates={templates}
                    isCompleted={isCompleted}
                    onStart={handleStartClick}
                />
            </div>
        </div>
    );
};
