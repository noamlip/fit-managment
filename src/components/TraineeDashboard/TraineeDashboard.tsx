import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Plus, Trash2 } from 'lucide-react';
import { AddTraineeModal } from './AddTraineeModal';
import './TraineeDashboard.scss';
import type { Trainee } from '../../types';
import { TraineeManager } from '../../containers/TraineeManager/TraineeManager';

export const TraineeDashboard: React.FC = () => {
    const { userRole, trainerName } = useConfig();
    const { trainees, deleteTrainee, updateTrainee } = useTrainee();
    const { exercises } = useWorkout();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);

    // Filter trainees based on role
    const visibleTrainees = userRole === 'coach'
        ? trainees
        : trainees.filter(t => t.name === trainerName);

    const activeTrainees = trainees.length;
    const totalExercises = exercises.length;

    return (
        <div className="trainee-dashboard">
            <h2>Dashboard</h2>

            {/* Summary Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <h3>Active Trainees</h3>
                    <div className="value">{activeTrainees}</div>
                </div>
                <div className="stat-card">
                    <h3>Library Exercises</h3>
                    <div className="value">{totalExercises}</div>
                </div>
                {/* Placeholder for future stat */}
                <div className="stat-card">
                    <h3>Pending Check-ins</h3>
                    <div className="value" style={{ color: 'rgba(255,255,255,0.3)' }}>0</div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>Trainees Management</h3>

            <div className="dashboard-grid">
                {/* Add New Card (Coach Only) */}
                {/* Assuming userRole from context is available if we import it, or just use useTrainee logic if we have roles there. 
                   Actually, TraineeDashboard is used ONLY by the coach in the current App structure (userRole === 'coach' ? WorkoutLibrary : TraineeDashboard), wait.
                   App.tsx line 38: 
                   userRole === 'coach' ? <WorkoutLibrary /> : <TraineeWorkoutPanel />
                   Wait, the user sees "TraineeDashboard" in line 35 of App.tsx initially?
                   Let's check App.tsx structure again from memory or previous view.
                   Ah, `activePage === 'dashboard'`. 
                   If `userRole === 'coach'`, they see broad metrics.
                   If `userRole === 'trainer'`, they might see their own.
                   But right now, `TraineeDashboard` mimics a coach view of all trainees.
                   The USER REQUEST says: "the trainee that the coach see is all the trainees that in te site only the coach can add new trainees".
                   So if a normal trainee logs in and goes to dashboard, what do they see?
                   Currently `App.tsx` renders `TraineeDashboard` for everyone on 'dashboard' page.
                   We need to restrict functionality inside `TraineeDashboard`.
                */}
                {userRole === 'coach' && (
                    <div className="add-card" onClick={() => setIsModalOpen(true)}>
                        <Plus className="icon" size={40} />
                        <span>Add New Trainee</span>
                    </div>
                )}

                {/* Trainee Cards */}
                {visibleTrainees.map((trainee: Trainee) => {
                    const trainedToday = trainee.lastWorkoutDate === new Date().toISOString().split('T')[0];

                    return (
                        <div key={trainee.id} className="trainee-card" onClick={() => setSelectedTrainee(trainee)}>
                            <div className="card-header">
                                <div className="avatar">
                                    {trainee.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="info">
                                    <h3>{trainee.name}</h3>
                                    <p className={trainedToday ? 'status-active' : 'status-inactive'}>
                                        {trainedToday ? 'Trained Today' : 'Not Trained Yet'}
                                    </p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat">
                                    <label>Weight</label>
                                    <span>{trainee.metrics.weight} kg</span>
                                </div>
                                <div className="stat">
                                    <label>Water</label>
                                    <span>{trainee.waterIntake || 0} L</span>
                                </div>
                                <div className="stat">
                                    <label>Goal</label>
                                    <span>{trainee.goals.targetWeight} kg</span>
                                </div>
                                <div className="stat">
                                    <label>Program</label>
                                    <span>PPL</span>
                                </div>
                            </div>

                            <div className="actions">
                                <button
                                    className="delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this trainee?')) deleteTrainee(trainee.id);
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && <AddTraineeModal onClose={() => setIsModalOpen(false)} />}

            {selectedTrainee && (
                <TraineeManager
                    trainee={trainees.find(t => t.id === selectedTrainee.id) || selectedTrainee}
                    onClose={() => setSelectedTrainee(null)}
                    onUpdate={(id, data) => {
                        updateTrainee(id, data);
                    }}
                />
            )}
        </div>
    );
};
