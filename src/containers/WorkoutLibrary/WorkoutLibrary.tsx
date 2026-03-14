import React, { useState, useEffect } from 'react';
import { useTrainee } from '../../context/TraineeContext';
import { useToast } from '../../context/ToastContext';
import { Dumbbell, UserPlus } from 'lucide-react';
import { ExerciseManager } from '../../components/WorkoutLibrary/ExerciseManager';
import { RoutineAssigner } from '../../components/WorkoutLibrary/RoutineAssigner';
import './WorkoutLibrary.scss';
import type { Exercise, WorkoutType } from '../../types';

export const WorkoutLibrary: React.FC = () => {
    const { trainees, updateTrainee } = useTrainee();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'exercises' | 'builder'>('exercises');
    const [exerciseDb, setExerciseDb] = useState<Record<string, string[]>>({});

    useEffect(() => {
        fetch('/data/exercises.json')
            .then(res => res.json())
            .then(data => setExerciseDb(data))
            .catch(err => console.error("Failed to load exercises", err));
    }, []);

    const saveChanges = async (newData: Record<string, string[]>) => {
        try {
            const res = await fetch('http://localhost:3001/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (res.ok) addToast("Changes saved successfully!", "success");
        } catch (e) {
            console.warn("Backend save failed:", e);
        }
    };

    const handleAddExercise = (category: string, name: string) => {
        const updatedList = [...(exerciseDb[category] || []), name.trim()];
        const newDb = { ...exerciseDb, [category]: updatedList };
        setExerciseDb(newDb);
        saveChanges(newDb);
    };

    const handleDeleteExercise = (category: string, item: string) => {
        const updatedList = exerciseDb[category].filter(x => x !== item);
        const newDb = { ...exerciseDb, [category]: updatedList };
        setExerciseDb(newDb);
        saveChanges(newDb);
    };

    const handleSaveRoutine = async (traineeId: string, type: WorkoutType, exercises: Exercise[]) => {
        const trainee = trainees.find(t => t.id === traineeId);
        if (!trainee) return;

        const currentRoutines = { ...(trainee.routines || {}) };
        currentRoutines[type] = exercises;

        updateTrainee(traineeId, { routines: currentRoutines });

        try {
            await fetch('http://localhost:3001/api/trainees/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ traineeId, routines: currentRoutines })
            });
            addToast(`${type.toUpperCase()} routine updated for ${trainee.name}`, 'success');
        } catch (e) {
            console.warn("Backend save failed:", e);
        }
    };

    return (
        <div className="workout-library">
            <header>
                <h2>Workout Library</h2>
                <p>Manage exercises database and define trainee routines.</p>
            </header>

            <div className="tabs">
                <button className={activeTab === 'exercises' ? 'active' : ''} onClick={() => setActiveTab('exercises')}>
                    <Dumbbell size={18} style={{ marginRight: 8 }} /> Exercise Database
                </button>
                <button className={activeTab === 'builder' ? 'active' : ''} onClick={() => setActiveTab('builder')}>
                    <UserPlus size={18} style={{ marginRight: 8 }} /> Assign Routine
                </button>
            </div>

            {activeTab === 'builder' ? (
                <RoutineAssigner trainees={trainees} onSaveRoutine={handleSaveRoutine} />
            ) : (
                <ExerciseManager
                    exerciseDb={exerciseDb}
                    onAddExercise={handleAddExercise}
                    onDeleteExercise={handleDeleteExercise}
                />
            )}
        </div>
    );
};
