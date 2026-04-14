import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { Exercise, ExerciseCatalog, WorkoutTemplate, WorkoutType } from '../types';

interface WorkoutContextType {
    exercises: Exercise[];
    exerciseCatalog: ExerciseCatalog;
    templates: WorkoutTemplate[];
    loading: boolean;
    error: Error | null;
    reloadCatalog: () => Promise<void>;
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

async function loadCatalogFromNetwork(bustCache: boolean): Promise<ExerciseCatalog> {
    const url = bustCache ? `${EXERCISES_URL}?t=${Date.now()}` : EXERCISES_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load exercises');
    return (await res.json()) as ExerciseCatalog;
}

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalog>({});
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const applyCatalog = useCallback((catalog: ExerciseCatalog) => {
        setExerciseCatalog(catalog);
        setExercises(catalogToExerciseLibrary(catalog));
        setTemplates(defaultTemplates(catalog));
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const catalog = await loadCatalogFromNetwork(false);
                if (cancelled) return;
                applyCatalog(catalog);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e : new Error('Workout load error'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [applyCatalog]);

    const reloadCatalog = useCallback(async () => {
        setError(null);
        try {
            const catalog = await loadCatalogFromNetwork(true);
            applyCatalog(catalog);
        } catch (e) {
            setError(e instanceof Error ? e : new Error('Workout load error'));
            throw e;
        }
    }, [applyCatalog]);

    const value = useMemo(
        () => ({ exercises, exerciseCatalog, templates, loading, error, reloadCatalog }),
        [exercises, exerciseCatalog, templates, loading, error, reloadCatalog]
    );

    return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export const useWorkout = (): WorkoutContextType => {
    const ctx = useContext(WorkoutContext);
    if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider');
    return ctx;
};
