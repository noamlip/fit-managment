import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Exercise, ExerciseCatalog, WorkoutTemplate, WorkoutType } from '../types';

interface WorkoutContextType {
    exercises: Exercise[];
    exerciseCatalog: ExerciseCatalog;
    templates: WorkoutTemplate[];
    loading: boolean;
    error: Error | null;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const EXERCISES_URL = '/data/exercises.json';

function catalogToExerciseLibrary(catalog: ExerciseCatalog): Exercise[] {
    const list: Exercise[] = [];
    let n = 0;
    for (const [bodyPart, names] of Object.entries(catalog)) {
        for (const name of names) {
            list.push({
                id: `ex-${n++}`,
                name,
                sets: 3,
                reps: '8-12',
                rest: 90,
                bodyPart,
            });
        }
    }
    return list;
}

function defaultTemplates(catalog: ExerciseCatalog): WorkoutTemplate[] {
    const pick = (part: string, count: number): Exercise[] => {
        const names = catalog[part] || [];
        return names.slice(0, count).map((name, i) => ({
            id: `tpl-${part}-${i}`,
            name,
            sets: 3,
            reps: '8-12',
            rest: 90,
            bodyPart: part,
        }));
    };
    return [
        {
            id: 'tpl-push',
            name: 'Push',
            type: 'push' as WorkoutType,
            exercises: [...pick('Chest', 2), ...pick('Shoulders', 2), ...pick('Triceps', 2)],
        },
        {
            id: 'tpl-pull',
            name: 'Pull',
            type: 'pull' as WorkoutType,
            exercises: [...pick('Back', 3), ...pick('Biceps', 2)],
        },
        {
            id: 'tpl-legs',
            name: 'Legs',
            type: 'legs' as WorkoutType,
            exercises: pick('Legs', 6),
        },
    ];
}

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalog>({});
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(EXERCISES_URL);
                if (!res.ok) throw new Error('Failed to load exercises');
                const catalog = (await res.json()) as ExerciseCatalog;
                if (cancelled) return;
                setExerciseCatalog(catalog);
                const lib = catalogToExerciseLibrary(catalog);
                setExercises(lib);
                setTemplates(defaultTemplates(catalog));
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e : new Error('Workout load error'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo(
        () => ({ exercises, exerciseCatalog, templates, loading, error }),
        [exercises, exerciseCatalog, templates, loading, error]
    );

    return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export const useWorkout = (): WorkoutContextType => {
    const ctx = useContext(WorkoutContext);
    if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider');
    return ctx;
};
