import React from 'react';
import { Calendar, CheckCircle, Dumbbell } from 'lucide-react';
import type { DailyWorkout, WorkoutTemplate, Exercise } from '../../types';

interface ITodaysWorkoutProps {
    schedule: DailyWorkout | undefined;
    templates: WorkoutTemplate[];
    isCompleted: boolean;
    onStart: () => void;
}

export const TodaysWorkout: React.FC<ITodaysWorkoutProps> = ({ schedule, templates, isCompleted, onStart }) => {
    if (!schedule || schedule.workoutType === 'rest') {
        return (
            <div className="rest-day-view">
                <div className="card-header">
                    <Calendar color="#00C49F" />
                    <h3>Rest Day</h3>
                </div>
                <p style={{ color: '#aaa', marginTop: '1rem' }}>
                    Take it easy today! Recovery is key to progress.
                </p>
            </div>
        );
    }

    const template = templates.find(t => t.type === schedule.workoutType);
    const exercisesToShow = schedule.exercises || template?.exercises || [];
    const workoutName = template?.name || (schedule.workoutType.charAt(0).toUpperCase() + schedule.workoutType.slice(1) + " Workout");

    return (
        <>
            <div className="card-header">
                {isCompleted ? <CheckCircle color="#00C49F" /> : <Dumbbell color="#00C49F" />}
                <h3>{isCompleted ? "Workout Completed" : "Today's Workout"}</h3>
                <span className="tag">{workoutName}</span>
            </div>
            <div className="workout-preview">
                {exercisesToShow.length > 0 ? (
                    exercisesToShow.map((ex: Exercise, idx: number) => (
                        <div key={ex.id || idx} className="exercise-row">
                            <span>{ex.name}</span>
                            <span className="sets">
                                {ex.sets} x {ex.reps}
                                {ex.rest ? ` (${ex.rest}s)` : ''}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="exercise-row">
                        <span style={{ fontStyle: 'italic', color: '#888' }}>
                            No exercises assigned for today.
                        </span>
                    </div>
                )}
            </div>
            <button className={`start-btn ${isCompleted ? 'completed' : ''}`} onClick={onStart}>
                {isCompleted ? (
                    <>Edit Feedback <CheckCircle size={16} /></>
                ) : (
                    <>Start Workout <Calendar size={16} /></>
                )}
            </button>
        </>
    );
};
