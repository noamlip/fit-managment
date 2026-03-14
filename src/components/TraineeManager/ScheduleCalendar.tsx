import React from 'react';

export interface IDayInfo {
    date: Date;
    dateStr: string;
    name: string;
    day: number;
    workout: string;
    status: string;
    isSelected: boolean;
}

interface IScheduleCalendarProps {
    weekDays: IDayInfo[];
    onDayClick: (dateStr: string | null) => void;
}

export const ScheduleCalendar: React.FC<IScheduleCalendarProps> = ({ weekDays, onDayClick }) => {
    return (
        <div className="schedule-preview">
            <h3>Upcoming Schedule</h3>
            <div className="manager-calendar">
                {weekDays.map((d, i) => (
                    <div
                        key={i}
                        className={`calendar-day ${d.isSelected ? 'selected' : ''}`}
                        onClick={() => onDayClick(d.isSelected ? null : d.dateStr)}
                    >
                        <span className="day-name">{d.name}</span>
                        <div className={`day-circle ${d.workout === 'Rest' ? 'rest' : 'active'}`}>
                            {d.day}
                        </div>
                        <span className="workout-label">{d.workout}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
