import React from 'react';
import { CheckCircle } from 'lucide-react';

interface IDayStatus {
    date: Date;
    name: string;
    day: number;
    isToday: boolean;
    workout: string;
    type: string;
    isDone: boolean;
}

interface IWeekStripProps {
    days: IDayStatus[];
}

export const WeekStrip: React.FC<IWeekStripProps> = ({ days }) => {
    return (
        <div className="week-calendar">
            {days.map((d, i) => (
                <div key={i} className={`day-item ${d.isToday ? 'active' : ''}`}>
                    <div className="date-group">
                        <span className="day-name">{d.name}</span>
                        <span className="day-num">{d.day}</span>
                    </div>
                    <div className={`day-circle ${d.type === 'rest' ? 'rest' : (d.isDone ? 'completed-workout' : 'active-workout')}`}>
                        {d.isDone ? (
                            <CheckCircle size={16} />
                        ) : d.type !== 'rest' ? (
                            <span className="workout-initial">{d.workout.charAt(0)}</span>
                        ) : (
                            <div className="status-dot rest"></div>
                        )}
                    </div>
                    <span className="workout-label">{d.workout}</span>
                </div>
            ))}
        </div>
    );
};
