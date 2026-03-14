import React, { useMemo, useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useToast } from '../../context/ToastContext';
import { WeightChart } from '../../components/WeightChart/WeightChart';
import { Activity } from 'lucide-react';
import { FeedbackModal } from '../../components/TraineeWorkoutPanel/FeedbackModal';
import { TodaysWorkout } from '../../components/TraineeWorkoutPanel/TodaysWorkout';
import { WeekStrip } from '../../components/TraineeWorkoutPanel/WeekStrip';
import './TraineeWorkoutPanel.scss';

export const TraineeWorkoutPanel: React.FC = () => {
    const { trainerName } = useConfig();
    const { trainees, updateTrainee } = useTrainee();
    const { templates } = useWorkout();
    const { addToast } = useToast();

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);

    const activeTrainee = useMemo(() => trainees.find(t => t.name === trainerName), [trainees, trainerName]);
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSchedule = activeTrainee?.schedule?.[todayStr];
    const isCompleted = todaysSchedule?.status === 'completed';

    useEffect(() => {
        fetch('/data/workout_feedback.json')
            .then(res => res.json())
            .then(data => setQuestions(data.questions))
            .catch(err => console.error("Failed to load feedback questions", err));
    }, []);

    const handleFeedbackSubmit = (answers: Record<string, any>) => {
        const missing = questions.some(q => q.required && !answers[q.id]);
        if (missing) {
            addToast("Please answer all questions before submitting.", 'error');
            return;
        }
        if (!activeTrainee) return;

        const updates: any = {};
        const weightQ = questions.find(q => q.text.toLowerCase().includes('weight'));
        const weightVal = weightQ ? parseFloat(answers[weightQ.id]) : null;

        if (weightVal && !isNaN(weightVal)) {
            updates.metrics = { ...activeTrainee.metrics, weight: weightVal };
            const currentHistory = activeTrainee.weightHistory || [];
            const otherEntries = currentHistory.filter(h => h.date !== todayStr);
            updates.weightHistory = [...otherEntries, { date: todayStr, weight: weightVal }]
                .sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
        }

        updates.schedule = {
            ...(activeTrainee.schedule || {}),
            [todayStr]: {
                ...(todaysSchedule || { workoutType: 'other', status: 'pending' }),
                status: 'completed' as const,
                feedback: answers
            }
        };
        updates.lastWorkoutDate = todayStr;

        updateTrainee(activeTrainee.id, updates);
        setShowFeedbackModal(false);
        addToast(isCompleted ? "Feedback updated!" : "Great job! Workout complete.", 'success');
    };

    const weekDays = useMemo(() => {
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
                workout: workoutType !== 'rest' ? (workoutType.charAt(0).toUpperCase() + workoutType.slice(1)) : 'Rest',
                type: workoutType,
                isDone: scheduled?.status === 'completed'
            };
        });
    }, [activeTrainee]);

    return (
        <div className="trainee-workout-panel">
            {showFeedbackModal && (
                <FeedbackModal
                    isCompleted={isCompleted}
                    questions={questions}
                    initialAnswers={(isCompleted && todaysSchedule?.feedback) ? todaysSchedule.feedback : {}}
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

            <div className="weight-tracker-card">
                <div className="card-header">
                    <Activity color="#00C49F" />
                    <h3>Weight Progress (7 Days)</h3>
                </div>
                <WeightChart
                    history={activeTrainee?.weightHistory || []}
                    currentWeight={activeTrainee?.metrics.weight || 0}
                />
            </div>

            <div className="todays-workout-card">
                <TodaysWorkout
                    schedule={todaysSchedule}
                    templates={templates}
                    isCompleted={isCompleted}
                    onStart={() => setShowFeedbackModal(true)}
                />
            </div>
        </div>
    );
};
