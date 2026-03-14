import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface IExerciseManagerProps {
    exerciseDb: Record<string, string[]>;
    onAddExercise: (category: string, name: string) => void;
    onDeleteExercise: (category: string, name: string) => void;
}

export const ExerciseManager: React.FC<IExerciseManagerProps> = ({ exerciseDb, onAddExercise, onDeleteExercise }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(Object.keys(exerciseDb)[0] || null);
    const [newExerciseName, setNewExerciseName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCategory && newExerciseName.trim()) {
            onAddExercise(selectedCategory, newExerciseName);
            setNewExerciseName('');
        }
    };

    return (
        <div className="exercises-manager-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', height: '100%', overflow: 'hidden' }}>
            <div className="categories-sidebar" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', padding: '1rem', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Body Parts</h3>
                <div className="category-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.keys(exerciseDb).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={selectedCategory === cat ? 'active' : ''}
                            style={{
                                padding: '0.8rem 1rem',
                                background: selectedCategory === cat ? 'rgba(0, 255, 204, 0.1)' : 'transparent',
                                border: selectedCategory === cat ? '1px solid #00ffcc' : '1px solid transparent',
                                borderRadius: '8px',
                                color: selectedCategory === cat ? '#00ffcc' : '#aaa',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {cat}
                            <span style={{ float: 'right', opacity: 0.5, fontSize: '0.8em' }}>{exerciseDb[cat].length}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="exercises-list-panel" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                {selectedCategory ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{selectedCategory} Exercises</h3>
                        </div>

                        <form onSubmit={handleAdd} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                            <input
                                value={newExerciseName}
                                onChange={e => setNewExerciseName(e.target.value)}
                                placeholder={`Add new ${selectedCategory} exercise...`}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '8px', padding: '0.8rem', color: '#fff' }}
                            />
                            <button type="submit" style={{ background: '#00ccaa', border: 'none', borderRadius: '8px', padding: '0 1.2rem', color: '#000', cursor: 'pointer' }}>
                                <Plus size={20} />
                            </button>
                        </form>

                        <div className="exercises-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {exerciseDb[selectedCategory]?.map((ex, idx) => (
                                <div key={idx} className="exercise-chip" style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{ex}</span>
                                    <button
                                        onClick={() => onDeleteExercise(selectedCategory!, ex)}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', opacity: 0.6 }}
                                        className="delete-btn-hover"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '3rem' }}>
                        Select a body part to manage exercises.
                    </div>
                )}
            </div>
        </div>
    );
};
