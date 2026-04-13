import { useMemo, useState, useCallback } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useToast } from '../../context/ToastContext';
import { useWorkoutFeedbackConfig } from '../../hooks/useWorkoutFeedbackConfig';
import { FeedbackModal } from '../../components/TraineeWorkoutPanel/FeedbackModal';
import { WorkoutSessionModal } from '../../components/TraineeWorkoutPanel/WorkoutSessionModal';
import type { DailyWorkout, Exercise, FeedbackAnswers, WorkoutSessionLog } from '../../types';
import { serializeFeedbackForStorage } from '../../lib/serializeFeedback';
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

    const activeTrainee = useMemo(() => trainees.find((t) => t.name === trainerName), [trainees, trainerName]);
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSchedule = activeTrainee?.schedule?.[todayStr];
    const isCompleted = todaysSchedule?.status === 'completed';

    const planExercises: Exercise[] = useMemo(() => {
        if (!todaysSchedule || todaysSchedule.workoutType === 'rest') return [];
        const template = templates.find((t) => t.type === todaysSchedule.workoutType);
        if (todaysSchedule.exercises && todaysSchedule.exercises.length > 0) {
            return todaysSchedule.exercises;
        }
        return template?.exercises || [];
    }, [todaysSchedule, templates]);

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

    const handleFeedbackSubmit = (answers: FeedbackAnswers) => {
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
                sessionLog: todaysSchedule?.sessionLog,
            },
        };

        updateTrainee(activeTrainee.id, {
            schedule: nextSchedule,
            lastWorkoutDate: todayStr,
        });
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

    const onStartWorkout = () => {
        if (isCompleted) {
            setShowFeedbackModal(true);
            return;
        }
        if (planExercises.length === 0) {
            addToast('No exercises scheduled for today.', 'warning');
            return;
        }
        setShowSessionModal(true);
    };

    const handleSessionFinish = (log: WorkoutSessionLog) => {
        if (!activeTrainee) return;
        const base: DailyWorkout = todaysSchedule || { workoutType: planExercises[0] ? 'other' : 'rest', status: 'pending' };
        updateTrainee(activeTrainee.id, {
            schedule: {
                ...(activeTrainee.schedule || {}),
                [todayStr]: {
                    ...base,
                    exercises: base.exercises?.length ? base.exercises : planExercises,
                    sessionLog: log,
                },
            },
        });
        setShowSessionModal(false);
        setShowFeedbackModal(true);
    };

    const handleSessionCancel = () => {
        setShowSessionModal(false);
    };

    return (
        <div className="trainee-workout-panel">
            {showSessionModal && (
                <WorkoutSessionModal
                    open={showSessionModal}
                    exercises={planExercises}
                    resumeLog={resumeLog}
                    onCancel={handleSessionCancel}
                    onFinish={handleSessionFinish}
                    onPersistDraft={persistSessionDraft}
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
                    onStart={onStartWorkout}
                />
            </div>
        </div>
    );
};
