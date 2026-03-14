import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Exercise, WorkoutTemplate } from '../types';

interface WorkoutContextType {
    exercises: Exercise[];
    templates: WorkoutTemplate[];
    loading: boolean;
    addExercise: (exercise: Omit<Exercise, 'id'>) => void;
    deleteExercise: (id: string) => void;
    addTemplate: (template: Omit<WorkoutTemplate, 'id'>) => void;
    deleteTemplate: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Initial Load
    useEffect(() => {
        const loadData = () => {
            try {
                const storedExercises = localStorage.getItem('exercises');
                const storedTemplates = localStorage.getItem('workout_templates');

                if (storedExercises) setExercises(JSON.parse(storedExercises));
                if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
            } catch (e) {
                console.error('Failed to load workout data', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Persistence
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('exercises', JSON.stringify(exercises));
        }
    }, [exercises, loading]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('workout_templates', JSON.stringify(templates));
        }
    }, [templates, loading]);

    const addExercise = (newExercise: Omit<Exercise, 'id'>) => {
        const id = `ex-${Date.now()}`;
        setExercises(prev => [...prev, { ...newExercise, id }]);
    };

    const deleteExercise = (id: string) => {
        setExercises(prev => prev.filter(e => e.id !== id));
    };

    const addTemplate = (newTemplate: Omit<WorkoutTemplate, 'id'>) => {
        const id = `wt-${Date.now()}`;
        setTemplates(prev => [...prev, { ...newTemplate, id }]);
    };

    const deleteTemplate = (id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    return (
        <WorkoutContext.Provider value={{
            exercises,
            templates,
            loading,
            addExercise,
            deleteExercise,
            addTemplate,
            deleteTemplate
        }}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkout = (): WorkoutContextType => {
    const context = useContext(WorkoutContext);
    if (context === undefined) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
};
