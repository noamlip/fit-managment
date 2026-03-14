import React, { useState } from 'react';
import { ArrowRight, Layout, Dumbbell, X } from 'lucide-react';
import type { Trainee, WorkoutType, Exercise } from '../../types';
import { WorkoutBuilder } from '../ContentBuilder/WorkoutBuilder';


interface IRoutineAssignerProps {
    trainees: Trainee[];
    onSaveRoutine: (traineeId: string, type: WorkoutType, exercises: Exercise[]) => void;
}

export const RoutineAssigner: React.FC<IRoutineAssignerProps> = ({ trainees, onSaveRoutine }) => {
    const [builderStep, setBuilderStep] = useState<'type' | 'trainee' | 'build'>('type');
    const [buildType, setBuildType] = useState<WorkoutType>('push');
    const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
    const [initialRoutine, setInitialRoutine] = useState<Exercise[]>([]);

    const handleTraineeSelect = (id: string) => {
        setSelectedTraineeId(id);
        const trainee = trainees.find(t => t.id === id);
        if (trainee?.routines?.[buildType]) {
            setInitialRoutine(trainee.routines[buildType]);
        } else {
            setInitialRoutine([]);
        }
        setBuilderStep('build');
    };

    const handleSave = (exercises: Exercise[]) => {
        if (selectedTraineeId) {
            onSaveRoutine(selectedTraineeId, buildType, exercises);
            setBuilderStep('type');
            setSelectedTraineeId(null);
        }
    };

    if (builderStep === 'build' && selectedTraineeId) {
        return (
            <div className="builder-wrapper" style={{ height: '70vh', position: 'relative' }}>
                <WorkoutBuilder
                    type={buildType}
                    date={`${trainees.find(t => t.id === selectedTraineeId)?.name}'s Routine`}
                    initialExercises={initialRoutine}
                    onSave={handleSave}
                    onClose={() => setBuilderStep('trainee')}
                />
            </div>
        );
    }

    return (
        <div className="builder-container" style={{ padding: '2rem' }}>
            {builderStep === 'type' && (
                <div className="step-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h3>Step 1: Select Workout Type</h3>
                    <p style={{ color: '#aaa', marginBottom: '2rem' }}>Choose the workout type to define for a trainee.</p>
                    <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        {['push', 'pull', 'legs', 'cardio', 'rest'].map(type => (
                            <button
                                key={type}
                                onClick={() => { setBuildType(type as WorkoutType); setBuilderStep('trainee'); }}
                                style={{
                                    padding: '2rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: type === 'push' ? '#ff6b6b' : type === 'pull' ? '#4dabf7' : type === 'legs' ? '#69db7c' : '#ccc'
                                }}>
                                    {type === 'push' && <ArrowRight size={20} style={{ transform: 'rotate(-45deg)' }} />}
                                    {type === 'pull' && <ArrowRight size={20} style={{ transform: 'rotate(135deg)' }} />}
                                    {type === 'legs' && <Layout size={20} />}
                                    {type === 'cardio' && <Dumbbell size={20} />}
                                    {type === 'rest' && <X size={20} />}
                                </div>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {builderStep === 'trainee' && (
                <div className="step-content">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <button onClick={() => setBuilderStep('type')} style={{ marginRight: '1rem', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                            <ArrowRight size={20} style={{ transform: 'rotate(180deg)', marginRight: 5 }} /> Back
                        </button>
                        <h3 style={{ margin: 0 }}>Step 2: Start {buildType.toUpperCase()} for...</h3>
                    </div>

                    <div className="trainee-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {trainees.map(t => (
                            <div
                                key={t.id}
                                onClick={() => handleTraineeSelect(t.id)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#00ccaa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem', fontWeight: 'bold', color: '#000' }}>
                                    {t.name.charAt(0)}
                                </div>
                                <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{t.name}</h4>
                                {t.routines?.[buildType] ? (
                                    <span style={{ fontSize: '0.75rem', color: '#000', background: '#00ccaa', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                        Set ({(t.routines[buildType]?.length || 0)})
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Not Set</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
