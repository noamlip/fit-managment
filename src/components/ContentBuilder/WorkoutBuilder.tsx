import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Exercise, WorkoutType } from '../../types';
import './WorkoutBuilder.scss';

interface WorkoutBuilderProps {
    type: WorkoutType;
    initialExercises?: Exercise[];
    onSave: (exercises: Exercise[]) => void;
    onClose: () => void;
    date: string;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ type, initialExercises = [], onSave, onClose, date }) => {
    const [availableExercises, setAvailableExercises] = useState<Record<string, string[]>>({});
    const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
    const [plannedExercises, setPlannedExercises] = useState<Exercise[]>(initialExercises);

    useEffect(() => {
        setPlannedExercises(initialExercises);
    }, [initialExercises]);

    useEffect(() => {
        fetch('/data/exercises.json')
            .then(res => res.json())
            .then(data => {
                setAvailableExercises(data);
                // Auto-select first body part
                const parts = Object.keys(data);
                if (parts.length > 0) setSelectedBodyPart(parts[0]);
            })
            .catch(err => console.error("Failed to load exercises", err));
    }, []);

    const addExercise = (name: string) => {
        const newExercise: Exercise = {
            id: `ex-${Date.now()}`,
            name,
            sets: 3,
            reps: '10',
            rest: 60,
            bodyPart: selectedBodyPart || 'Other'
        };
        setPlannedExercises([...plannedExercises, newExercise]);
    };

    const updateExercise = (id: string, field: keyof Exercise, value: any) => {
        setPlannedExercises(prev => prev.map(ex =>
            ex.id === id ? { ...ex, [field]: value } : ex
        ));
    };

    const removeExercise = (id: string) => {
        setPlannedExercises(prev => prev.filter(ex => ex.id !== id));
    };

    // Filter body parts relevant to workout type (optional heuristics)
    // For now, show all parts but maybe sorting could strictly follow type?
    // Let's just show all available categories from JSON.

    return (
        <div className="workout-builder-modal">
            <div className="builder-content">
                <header>
                    <div>
                        <h2>Build {type.charAt(0).toUpperCase() + type.slice(1)} Workout</h2>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>For {date}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </header>

                <div className="builder-body">
                    <div className="selection-panel">
                        <h3>Exercise Library</h3>
                        <div className="body-part-list">
                            {Object.keys(availableExercises).map(part => (
                                <button
                                    key={part}
                                    className={selectedBodyPart === part ? 'active' : ''}
                                    onClick={() => setSelectedBodyPart(part)}
                                >
                                    {part}
                                </button>
                            ))}
                        </div>

                        <div className="exercise-list">
                            {selectedBodyPart && availableExercises[selectedBodyPart]?.map(exName => (
                                <div key={exName} className="exercise-item">
                                    <span>{exName}</span>
                                    <button onClick={() => addExercise(exName)} style={{
                                        background: 'transparent',
                                        border: '1px solid #00f2ff',
                                        color: '#00f2ff',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="plan-panel">
                        <h3>Workout Plan ({plannedExercises.length} exercises)</h3>
                        {plannedExercises.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                                No exercises added yet. Select from the library on the left.
                            </div>
                        ) : (
                            plannedExercises.map((ex, idx) => (
                                <div key={ex.id} className="exercise-card">
                                    <div className="card-header">
                                        <h4>{idx + 1}. {ex.name}</h4>
                                        <button className="remove-btn" onClick={() => removeExercise(ex.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="inputs-grid">
                                        <div className="input-group">
                                            <label>Sets</label>
                                            <input
                                                type="number"
                                                value={ex.sets}
                                                onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Reps</label>
                                            <input
                                                type="text"
                                                value={ex.reps}
                                                onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Rest (sec)</label>
                                            <input
                                                type="number"
                                                value={ex.rest || 60}
                                                onChange={(e) => updateExercise(ex.id, 'rest', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <footer>
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="save-btn" onClick={() => onSave(plannedExercises)}>
                        Save Workout <Save size={16} style={{ marginLeft: '8px' }} />
                    </button>
                </footer>
            </div>
        </div>
    );
};
