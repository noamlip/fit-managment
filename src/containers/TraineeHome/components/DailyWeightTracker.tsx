import React, { useMemo, useState } from 'react';
import { useTrainee } from '../../../context/TraineeContext';
import { useToast } from '../../../context/ToastContext';
import { WeightChart } from '../../../components/WeightChart/WeightChart';
import { Activity, CheckCircle } from 'lucide-react';
import { FeedbackModal } from '../../../components/TraineeWorkoutPanel/FeedbackModal';
import type { Trainee } from '../../../types';
import './DailyWeightTracker.scss';

interface IPropsDailyWeightTracker {
    activeTrainee: Trainee | undefined;
}

export const DailyWeightTracker: React.FC<IPropsDailyWeightTracker> = ({ activeTrainee }) => {
    const { updateTrainee } = useTrainee();
    const { addToast } = useToast();

    const todayStr = new Date().toISOString().split('T')[0];
    const [showDailyWeightModal, setShowDailyWeightModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);

    const getSuggestedWeight = (dateStr: string) => {
        if (!activeTrainee) return '';

        const history = activeTrainee.weightHistory || [];
        const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

        const currentEntry = sortedHistory.find(h => h.date === dateStr);
        if (currentEntry) return currentEntry.weight;

        const previousEntry = sortedHistory.find(h => h.date < dateStr);
        if (previousEntry) return previousEntry.weight;

        return activeTrainee.metrics?.weight || '';
    };

    const weekDays = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dateObj = new Date(dateStr);
            result.push({
                dateStr,
                dateObj,
                name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                day: dateObj.getDate()
            });
        }
        return result;
    }, []);

    const handleWeightSubmit = (answers: Record<string, any>) => {
        if (!activeTrainee) return;

        const weightVal = parseFloat(answers['weight']);

        if (weightVal && !isNaN(weightVal)) {
            const updates: any = {};
            updates.metrics = { ...activeTrainee.metrics, weight: weightVal };
            const currentHistory = activeTrainee.weightHistory || [];
            const otherEntries = currentHistory.filter(h => h.date !== selectedDate);
            updates.weightHistory = [...otherEntries, { date: selectedDate, weight: weightVal }]
                .sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

            updateTrainee(activeTrainee.id, updates);
            setShowDailyWeightModal(false);
            addToast("Weight updated for " + selectedDate + "!", 'success');
        } else {
            addToast("Please enter a valid weight.", 'error');
        }
    };

    return (
        <div className="weight-tracker-card">
            {showDailyWeightModal && (
                <FeedbackModal
                    isCompleted={false}
                    questions={[{
                        id: 'weight',
                        text: `What was your body weight (kg) on ${selectedDate}?`,
                        type: 'number',
                        required: true,
                        config: { placeholder: 'e.g., 75.5' }
                    }]}
                    initialAnswers={{ weight: getSuggestedWeight(selectedDate) }}
                    onSubmit={handleWeightSubmit}
                    onCancel={() => setShowDailyWeightModal(false)}
                    title="Log Daily Weight"
                    submitText="Save Weight"
                />
            )}
            <div className="card-header-flex">
                <div className="header-title">
                    <Activity color="#00C49F" />
                    <h3>Weight Progress (7 Days)</h3>
                    <span style={{ color: '#aaa', fontSize: '0.9rem', marginLeft: '12px', fontWeight: 'normal' }}>* Click a day below to update weight</span>
                </div>
            </div>

            <div className="daily-weight-circles">
                {weekDays.map((d, i) => {
                    const historyEntry = activeTrainee?.weightHistory?.find(h => h.date === d.dateStr);
                    return (
                        <div
                            key={i}
                            className={`day-item ${d.dateStr === todayStr ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedDate(d.dateStr);
                                setShowDailyWeightModal(true);
                            }}
                        >
                            <div className="date-group">
                                <span className="day-name">{d.name}</span>
                                <span className="day-num">{d.day}</span>
                            </div>
                            <div className={`day-circle ${historyEntry ? 'completed-workout' : (d.dateStr === todayStr ? 'active-workout' : 'rest')}`}>
                                {historyEntry ? (
                                    <CheckCircle size={16} />
                                ) : (
                                    <div className={`status-dot ${d.dateStr === todayStr ? 'active' : 'rest'}`}></div>
                                )}
                            </div>
                            <span className="workout-label">
                                {historyEntry ? `${historyEntry.weight}kg` : '--'}
                            </span>
                        </div>
                    );
                })}
            </div>
            <WeightChart
                history={activeTrainee?.weightHistory || []}
                currentWeight={activeTrainee?.metrics?.weight || 0}
            />
        </div>
    );
};
