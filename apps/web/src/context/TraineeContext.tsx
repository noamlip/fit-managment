import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { Trainee, TraineeCalculated, TraineeMetrics } from '../types';
import { debounce } from '../lib/debounce';

interface TraineeContextType {
    trainees: Trainee[];
    loading: boolean;
    error: Error | null;
    addTrainee: (trainee: Omit<Trainee, 'id' | 'calculated'>) => void;
    updateTrainee: (id: string, updates: Partial<Trainee>) => void;
    deleteTrainee: (id: string) => void;
    calculateStats: (metrics: TraineeMetrics) => TraineeCalculated;
}

const TraineeContext = createContext<TraineeContextType | undefined>(undefined);

const PERSIST_DEBOUNCE_MS = 400;

export const TraineeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const persistRef = useRef(
        debounce((payload: Trainee[]) => {
            localStorage.setItem('trainees', JSON.stringify(payload));
        }, PERSIST_DEBOUNCE_MS)
    );

    const calculateStats = useCallback((metrics: TraineeMetrics): TraineeCalculated => {
        const { weight, height, age, gender, activityLevel } = metrics;
        const heightM = height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        let bmr = 10 * weight + 6.25 * height - 5 * age;
        bmr = gender === 'male' ? bmr + 5 : bmr - 161;
        bmr = Math.round(bmr);
        const tdee = Math.round(bmr * activityLevel);
        return { bmi, bmr, tdee };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/data/trainees.json');
                if (!res.ok) throw new Error('Failed to load trainees');
                const data = (await res.json()) as Trainee[];
                const stored = localStorage.getItem('trainees');
                const useStored = stored
                    ? (() => {
                          try {
                              return JSON.parse(stored) as Trainee[];
                          } catch {
                              return null;
                          }
                      })()
                    : null;
                const source = useStored && useStored.length > 0 ? useStored : data;
                const enriched = source.map((t) => ({
                    ...t,
                    calculated: calculateStats(t.metrics),
                    schedule: t.schedule || {},
                }));
                if (!cancelled) {
                    setTrainees(enriched);
                    localStorage.setItem('trainees', JSON.stringify(enriched));
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [calculateStats]);

    useEffect(() => {
        if (!loading && trainees.length > 0) {
            persistRef.current(trainees);
        }
    }, [trainees, loading]);

    useEffect(() => {
        const flush = () => persistRef.current.flush();
        const onVis = () => {
            if (document.visibilityState === 'hidden') flush();
        };
        document.addEventListener('visibilitychange', onVis);
        window.addEventListener('pagehide', flush);
        return () => {
            document.removeEventListener('visibilitychange', onVis);
            window.removeEventListener('pagehide', flush);
            persistRef.current.cancel();
        };
    }, []);

    const addTrainee = useCallback(
        (newTrainee: Omit<Trainee, 'id' | 'calculated'>) => {
            const id = `t-${Date.now()}`;
            const calculated = calculateStats(newTrainee.metrics);
            setTrainees((prev) => [...prev, { ...newTrainee, id, calculated }]);
        },
        [calculateStats]
    );

    const updateTrainee = useCallback(
        (id: string, updates: Partial<Trainee>) => {
            setTrainees((prev) =>
                prev.map((t) => {
                    if (t.id !== id) return t;
                    const updated = { ...t, ...updates };
                    if (updates.metrics) {
                        updated.calculated = calculateStats(updated.metrics);
                    }
                    return updated;
                })
            );
        },
        [calculateStats]
    );

    const deleteTrainee = useCallback((id: string) => {
        setTrainees((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            trainees,
            loading,
            error,
            addTrainee,
            updateTrainee,
            deleteTrainee,
            calculateStats,
        }),
        [trainees, loading, error, addTrainee, updateTrainee, deleteTrainee, calculateStats]
    );

    return <TraineeContext.Provider value={value}>{children}</TraineeContext.Provider>;
};

export const useTrainee = (): TraineeContextType => {
    const ctx = useContext(TraineeContext);
    if (!ctx) throw new Error('useTrainee must be used within TraineeProvider');
    return ctx;
};
