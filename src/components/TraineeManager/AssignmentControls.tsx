import React from 'react';
import type { WorkoutType } from '../../types';

interface IAssignmentControlsProps {
    selectedDate: string | null;
    onAssign: (type: WorkoutType) => void;
}

export const AssignmentControls: React.FC<IAssignmentControlsProps> = ({ selectedDate, onAssign }) => {
    return (
        <div className="workout-assignment">
            <h3>Assign Workout</h3>
            <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {selectedDate
                    ? `Assigning to selected date: ${selectedDate}`
                    : "Clicking a workout selects the next available empty day."}
            </p>
            <div className="options-grid">
                {['push', 'pull', 'legs', 'cardio', 'rest'].map((type) => (
                    <button
                        key={type}
                        className={`assignment-btn ${selectedDate ? 'active-context' : ''}`}
                        onClick={() => onAssign(type as WorkoutType)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};
