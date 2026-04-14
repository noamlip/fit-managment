import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Plus, Trash2 } from 'lucide-react';
import { AddTraineeModal } from './AddTraineeModal';
import { NutritionTable } from '../NutritionTable/NutritionTable';
import './TraineeDashboard.scss';
import type { Trainee } from '../../types';
import { TraineeManager } from '../../containers/TraineeManager/TraineeManager';
import { TraineeHubOverlay } from '../../containers/TraineeHome/TraineeHubOverlay';
import type { AppPage } from '../Layout/Layout';

interface TraineeDashboardProps {
    onNavigate?: (page: AppPage) => void;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({ onNavigate }) => {
    const { userRole, trainerName, selectTrainee, selectedTrainee: focusedClientName } = useConfig();
    const { trainees, deleteTrainee, updateTrainee } = useTrainee();
    const { exercises } = useWorkout();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
    const [menuEditorOpenForTraineeId, setMenuEditorOpenForTraineeId] = useState<string | null>(null);
    const [hubOpen, setHubOpen] = useState(false);

    const activeClientForHub = useMemo(
        () =>
            userRole === 'coach' && focusedClientName
                ? trainees.find((t) => t.name === focusedClientName)
                : undefined,
        [userRole, focusedClientName, trainees]
    );

    // Filter trainees based on role
    const visibleTrainees = userRole === 'coach'
        ? trainees
        : trainees.filter(t => t.name === trainerName);

    const activeTrainees = trainees.length;
    const totalExercises = exercises.length;
    const nutritionUpdatesPending = trainees.filter((t) => t.nutritionPendingCoachReview).length;

    const menuEditorOpen = !!menuEditorOpenForTraineeId && userRole === 'coach';
    useEscapeToClose(() => setMenuEditorOpenForTraineeId(null), menuEditorOpen);

    return (
        <div className="trainee-dashboard">
            <h2>{userRole === 'coach' ? 'Trainees' : 'Dashboard'}</h2>

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
                <div className="stat-card">
                    <h3>Nutrition updates</h3>
                    <div className="value">{nutritionUpdatesPending}</div>
                </div>
            </div>

            <h3 className="trainee-dashboard-section-title">Trainees management</h3>

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
                        <div
                            key={trainee.id}
                            className={`trainee-card ${
                                userRole === 'coach' && focusedClientName === trainee.name
                                    ? 'trainee-card--selected'
                                    : ''
                            }`}
                            onClick={() => {
                                setSelectedTrainee(trainee);
                                if (userRole === 'coach') selectTrainee(trainee.name);
                            }}
                        >
                            <div className="card-header">
                                <div className="avatar">
                                    {trainee.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="info">
                                    <h3>{trainee.name}</h3>
                                    <p className={trainedToday ? 'status-active' : 'status-inactive'}>
                                        {trainedToday ? 'Trained Today' : 'Not Trained Yet'}
                                    </p>
                                    {trainee.nutritionPendingCoachReview && (
                                        <span className="nutrition-review-badge">Menu updated</span>
                                    )}
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

            {userRole === 'coach' && activeClientForHub && onNavigate && (
                <>
                    <button type="button" className="trainee-dashboard-hub-cta" onClick={() => setHubOpen(true)}>
                        <span>Open client dashboard</span>
                        <ChevronRight size={20} aria-hidden />
                    </button>
                    <TraineeHubOverlay
                        variant="coach"
                        open={hubOpen}
                        onClose={() => setHubOpen(false)}
                        activeTrainee={activeClientForHub}
                        trainerName={activeClientForHub.name}
                        onGoToWorkouts={() => {
                            setHubOpen(false);
                            onNavigate('workouts');
                        }}
                        updateTrainee={updateTrainee}
                    />
                </>
            )}

            {isModalOpen && <AddTraineeModal onClose={() => setIsModalOpen(false)} />}

            {selectedTrainee && (
                <TraineeManager
                    trainee={trainees.find((t) => t.id === selectedTrainee.id) || selectedTrainee}
                    onClose={() => setSelectedTrainee(null)}
                    onUpdate={(id, data) => {
                        updateTrainee(id, data);
                    }}
                    onOpenMenuEditor={(t) => {
                        selectTrainee(t.name);
                        setMenuEditorOpenForTraineeId(t.id);
                    }}
                />
            )}

            {menuEditorOpenForTraineeId && userRole === 'coach' && (
                <div
                    className="coach-menu-editor-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edit trainee daily menu"
                    onClick={() => setMenuEditorOpenForTraineeId(null)}
                >
                    <div className="coach-menu-editor-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="coach-menu-editor-head">
                            <h3>Edit daily menu</h3>
                            <button type="button" className="coach-menu-editor-close" onClick={() => setMenuEditorOpenForTraineeId(null)}>
                                Close
                            </button>
                        </div>
                        <div className="coach-menu-editor-body coach-menu-editor-body--nutrition">
                            <NutritionTable hidePanelTitle variant="coach" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
