import React, { useEffect, useRef, useState } from 'react';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import { useToast } from '../../context/ToastContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useTrainee } from '../../context/TraineeContext';
import { ProgressTab } from '../../components/TraineeManager/ProgressTab';
import { ProgressPhotosTab } from '../../components/TraineeManager/ProgressPhotosTab';
import { WeeklyCheckinsTab } from '../../components/TraineeManager/WeeklyCheckinsTab';
import { WorkoutBuilder } from '../../components/ContentBuilder/WorkoutBuilder';
import { WorkoutsTab } from '../../components/TraineeManager/WorkoutsTab';
import { NutritionTab } from '../../components/TraineeManager/NutritionTab';
import { RoutineTemplatesEditor } from '../TraineeHome/components/RoutineTemplatesEditor';
import { X, Dumbbell, Utensils, Activity, ClipboardCheck, Camera, LayoutTemplate } from 'lucide-react';
import type { Exercise, Trainee, WorkoutType } from '../../types';
import './TraineeManager.scss';

type ManagerTab = 'progress' | 'workouts' | 'templates' | 'nutrition' | 'checkins' | 'photos';

interface ITraineeManagerProps {
    trainee: Trainee;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<Trainee>) => void;
    onOpenMenuEditor?: (trainee: Trainee) => void;
}

export const TraineeManager: React.FC<ITraineeManagerProps> = ({
    trainee,
    onClose,
    onUpdate,
    onOpenMenuEditor,
}) => {
    const [activeTab, setActiveTab] = useState<ManagerTab>('progress');
    const { addToast } = useToast();
    const { exerciseCatalog } = useWorkout();
    const { updateTrainee } = useTrainee();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [draftType, setDraftType] = useState<WorkoutType | null>(null);
    const [templatesEscapeLock, setTemplatesEscapeLock] = useState(false);
    const prevTabRef = useRef<ManagerTab>(activeTab);

    useEscapeToClose(onClose, !showBuilder && !templatesEscapeLock);

    useEffect(() => {
        const entered = prevTabRef.current !== 'workouts' && activeTab === 'workouts';
        prevTabRef.current = activeTab;
        if (entered) {
            updateTrainee(trainee.id, { coachLastSeenWorkoutFeedbackAt: new Date().toISOString() });
        }
    }, [activeTab, trainee.id, updateTrainee]);

    const assignWorkout = (type: WorkoutType) => {
        let targetDateStr = selectedDate;

        if (!targetDateStr && type !== 'rest') {
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const s = d.toISOString().split('T')[0];
                if (!trainee.schedule?.[s]) {
                    targetDateStr = s;
                    break;
                }
            }
            if (!targetDateStr) {
                addToast('No slots available', 'error');
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

    const handleBuilderSave = (exercises: Exercise[]) => {
        if (!selectedDate || !draftType) return;
        const currentSchedule = { ...(trainee.schedule || {}) };
        currentSchedule[selectedDate] = {
            workoutType: draftType,
            status: 'pending',
            exercises: exercises,
        };
        onUpdate(trainee.id, { schedule: currentSchedule });
        setShowBuilder(false);
        setDraftType(null);
        addToast('Workout assigned successfully', 'success');
    };

    const markFeedbackSeen = () => {
        updateTrainee(trainee.id, { coachLastSeenWorkoutFeedbackAt: new Date().toISOString() });
    };

    const handleEditMenu = () => {
        if (onOpenMenuEditor) {
            onOpenMenuEditor(trainee);
        } else {
            addToast('Menu editor is unavailable.', 'error');
        }
    };

    return (
        <div className="modal-overlay">
            {showBuilder && draftType && selectedDate && (
                <WorkoutBuilder
                    type={draftType}
                    exerciseCatalog={exerciseCatalog}
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
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="manager-tabs">
                    <button
                        type="button"
                        className={activeTab === 'progress' ? 'active' : ''}
                        onClick={() => setActiveTab('progress')}
                    >
                        <Activity size={18} /> Progress
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'workouts' ? 'active' : ''}
                        onClick={() => setActiveTab('workouts')}
                    >
                        <Dumbbell size={18} /> Workouts
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'templates' ? 'active' : ''}
                        onClick={() => setActiveTab('templates')}
                    >
                        <LayoutTemplate size={18} /> Templates
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'nutrition' ? 'active' : ''}
                        onClick={() => setActiveTab('nutrition')}
                    >
                        <Utensils size={18} /> Nutrition
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'checkins' ? 'active' : ''}
                        onClick={() => setActiveTab('checkins')}
                    >
                        <ClipboardCheck size={18} /> Check-ins
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'photos' ? 'active' : ''}
                        onClick={() => setActiveTab('photos')}
                    >
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
                            onMarkFeedbackSeen={markFeedbackSeen}
                        />
                    )}
                    {activeTab === 'templates' && (
                        <RoutineTemplatesEditor
                            trainee={trainee}
                            updateTrainee={onUpdate}
                            onEscapeLockChange={setTemplatesEscapeLock}
                        />
                    )}
                    {activeTab === 'nutrition' && (
                        <NutritionTab trainee={trainee} onUpdate={onUpdate} onEditMenu={handleEditMenu} />
                    )}
                    {activeTab === 'progress' && <ProgressTab trainee={trainee} />}
                    {activeTab === 'checkins' && <WeeklyCheckinsTab key={trainee.id} trainee={trainee} />}
                    {activeTab === 'photos' && <ProgressPhotosTab trainee={trainee} />}
                </div>
            </div>
        </div>
    );
};
