import { useState } from 'react';
import type { Trainee } from '../../../types';
import { useTrainee } from '../../../context/TraineeContext';
import './DailyWeightTracker.scss';

interface Props {
    activeTrainee: Trainee | undefined;
}

export const DailyWeightTracker: React.FC<Props> = ({ activeTrainee }) => {
    const { updateTrainee } = useTrainee();
    const [input, setInput] = useState('');

    if (!activeTrainee) return null;

    const today = new Date().toISOString().split('T')[0];
    const history = [...(activeTrainee.weightHistory || [])].sort((a, b) => b.date.localeCompare(a.date));

    const logToday = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(input.replace(',', '.'));
        if (!Number.isFinite(w) || w <= 0) return;
        const nextHist = [...(activeTrainee.weightHistory || [])];
        const idx = nextHist.findIndex((r) => r.date === today);
        if (idx >= 0) nextHist[idx] = { date: today, weight: w };
        else nextHist.push({ date: today, weight: w });
        updateTrainee(activeTrainee.id, {
            weightHistory: nextHist,
            metrics: { ...activeTrainee.metrics, weight: w },
        });
        setInput('');
    };

    return (
        <div className="daily-weight-tracker">
            <h3>Weight</h3>
            <form onSubmit={logToday} className="weight-form">
                <input
                    type="text"
                    inputMode="decimal"
                    placeholder={`Today (${today}) kg`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit">Log</button>
            </form>
            <ul>
                {history.slice(0, 8).map((r) => (
                    <li key={r.date}>
                        <span>{r.date}</span>
                        <strong>{r.weight} kg</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
};
