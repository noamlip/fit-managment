import React, { useMemo } from 'react';
import { AssignmentControls } from './AssignmentControls';
import type { Trainee, WorkoutType } from '../../types';
import { type IDayInfo, ScheduleCalendar } from './ScheduleCalendar';

interface IWorkoutsTabProps {
    trainee: Trainee;
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
    onAssign: (type: WorkoutType) => void;
}

export const WorkoutsTab: React.FC<IWorkoutsTabProps> = ({ trainee, selectedDate, onDateSelect, onAssign }) => {

    const weekDays: IDayInfo[] = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const scheduled = trainee.schedule?.[dateStr];

            return {
                date: d,
                dateStr,
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                day: d.getDate(),
                workout: scheduled?.workoutType ? (scheduled.workoutType.charAt(0).toUpperCase() + scheduled.workoutType.slice(1)) : 'Rest',
                status: scheduled?.status || 'pending',
                isSelected: dateStr === selectedDate
            };
        });
    }, [trainee.schedule, selectedDate]);

    return (
        <>
            <AssignmentControls selectedDate={selectedDate} onAssign={onAssign} />
            <ScheduleCalendar weekDays={weekDays} onDayClick={onDateSelect} />
        </>
    );
};
