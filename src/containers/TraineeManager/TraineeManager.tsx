import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { ProgressTab } from '../../components/TraineeManager/ProgressTab';
import { PhotosTab } from '../../components/TraineeManager/PhotosTab';
import { FeedbackTab } from '../../components/TraineeManager/FeedbackTab';
import { WeeklyCheckinsTab } from '../../components/TraineeManager/WeeklyCheckinsTab';
import { WorkoutBuilder } from '../../components/ContentBuilder/WorkoutBuilder';
import { WorkoutsTab } from '../../components/TraineeManager/WorkoutsTab';
import { NutritionTab } from '../../components/TraineeManager/NutritionTab';
import { X, Dumbbell, Utensils, Activity, MessageSquare, ClipboardCheck, Camera } from 'lucide-react';
import type { Trainee, WorkoutType } from '../../types';
import './TraineeManager.scss';

interface ITraineeManagerProps {
    trainee: Trainee;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<Trainee>) => void;
}

export const TraineeManager: React.FC<ITraineeManagerProps> = ({ trainee, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'workouts' | 'nutrition' | 'progress' | 'feedback' | 'checkins' | 'photos'>('progress');
    const { addToast } = useToast();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [draftType, setDraftType] = useState<WorkoutType | null>(null);

    const assignWorkout = (type: WorkoutType) => {
        let targetDateStr = selectedDate;

        // Auto-find next slot if no date selected & not rest
        if (!targetDateStr && type !== 'rest') {
            const today = new Date();
            let d = new Date(today);
            for (let i = 0; i < 30; i++) {
                const s = d.toISOString().split('T')[0];
                if (!trainee.schedule?.[s]) {
                    targetDateStr = s;
                    break;
                }
                d.setDate(d.getDate() + 1);
            }
            if (!targetDateStr) {
                addToast("No slots available", "error");
                return;
            }
            setSelectedDate(targetDateStr);
        }

        if (type === 'rest') {
            const date = targetDateStr || new Date().toISOString().split('T')[0];
            const currentSchedule = { ...(trainee.schedule || {}) };
            currentSchedule[date] = { workoutType: 'rest', status: 'pending' };
            onUpdate(trainee.id, { schedule: currentSchedule });
        } else {
            setDraftType(type);
            setShowBuilder(true);
        }
    };

    const handleBuilderSave = (exercises: any[]) => {
        if (!selectedDate || !draftType) return;
        const currentSchedule = { ...(trainee.schedule || {}) };
        currentSchedule[selectedDate] = {
            workoutType: draftType,
            status: 'pending',
            exercises: exercises
        };
        onUpdate(trainee.id, { schedule: currentSchedule });
        setShowBuilder(false);
        setDraftType(null);
        addToast("Workout assigned successfully", "success");
    };

    return (
        <div className="modal-overlay">
            {showBuilder && draftType && selectedDate && (
                <WorkoutBuilder
                    type={draftType}
                    date={selectedDate}
                    onClose={() => setShowBuilder(false)}
                    onSave={handleBuilderSave}
                    initialExercises={
                        trainee.schedule?.[selectedDate]?.exercises ||
                        trainee.routines?.[draftType] ||
                        []
                    }
                />
            )}

            <div className="manager-modal">
                <div className="modal-header">
                    <div className="trainee-info">
                        <h2>Manage {trainee.name}</h2>
                        <span className="status">Active Trainee</span>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="manager-tabs">
                    <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>
                        <Activity size={18} /> Progress
                    </button>
                    <button className={activeTab === 'workouts' ? 'active' : ''} onClick={() => setActiveTab('workouts')}>
                        <Dumbbell size={18} /> Workouts
                    </button>
                    <button className={activeTab === 'nutrition' ? 'active' : ''} onClick={() => setActiveTab('nutrition')}>
                        <Utensils size={18} /> Nutrition
                    </button>
                    <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
                        <MessageSquare size={18} /> Daily Feed
                    </button>
                    <button className={activeTab === 'checkins' ? 'active' : ''} onClick={() => setActiveTab('checkins')}>
                        <ClipboardCheck size={18} /> Check-ins
                    </button>
                    <button className={activeTab === 'photos' ? 'active' : ''} onClick={() => setActiveTab('photos')}>
                        <Camera size={18} /> Photos
                    </button>
                </div>

                <div className="manager-content">
                    {activeTab === 'workouts' && (
                        <WorkoutsTab
                            trainee={trainee}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            onAssign={assignWorkout}
                        />
                    )}
                    {activeTab === 'nutrition' && (
                        <NutritionTab
                            trainee={trainee}
                            onUpdate={onUpdate}
                            onEditMenu={() => addToast('Redirect to Menu Editor', 'info')}
                        />
                    )}
                    {activeTab === 'progress' && <ProgressTab trainee={trainee} />}
                    {activeTab === 'photos' && <PhotosTab trainee={trainee} />}
                    {activeTab === 'feedback' && <FeedbackTab trainee={trainee} />}
                    {activeTab === 'checkins' && <WeeklyCheckinsTab trainee={trainee} />}
                </div>
            </div>
        </div>
    );
};
