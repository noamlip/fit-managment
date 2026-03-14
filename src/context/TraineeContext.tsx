import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Trainee, TraineeMetrics, TraineeCalculated } from '../types';

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

export const TraineeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Initial Load
    useEffect(() => {
        const loadTrainees = async () => {
            try {
                // Always load from JSON to ensure file updates are reflected
                const res = await fetch('/data/trainees.json');
                if (!res.ok) throw new Error('Failed to load initial trainees');
                const data: Trainee[] = await res.json();

                // Merge with localStorage if needed, or just prioritize JSON? 
                // Given the request "all data must be in trainees.json", we prioritize JSON.
                // However, to keep 'persistence' feeling for the session, we might want to check
                // if there are specific USER edits in local storage that aren't in JSON?
                // For now, based on instructions, we make JSON the Source of Truth.

                // Calculate stats for initial data
                const enriched = data.map(t => ({
                    ...t,
                    calculated: calculateStats(t.metrics),
                    schedule: t.schedule || {}
                }));

                setTrainees(enriched);
                localStorage.setItem('trainees', JSON.stringify(enriched));
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error loading trainees'));
            } finally {
                setLoading(false);
            }
        };
        loadTrainees();
    }, []);

    // Persistence
    useEffect(() => {
        if (!loading && trainees.length > 0) {
            localStorage.setItem('trainees', JSON.stringify(trainees));
        }
    }, [trainees, loading]);

    const calculateStats = (metrics: TraineeMetrics): TraineeCalculated => {
        const { weight, height, age, gender, activityLevel } = metrics;

        // BMI
        const heightM = height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

        // BMR (Mifflin-St Jeor)
        let bmr = 10 * weight + 6.25 * height - 5 * age;
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }
        bmr = Math.round(bmr);

        // TDEE
        const tdee = Math.round(bmr * activityLevel);

        return { bmi, bmr, tdee };
    };

    const addTrainee = (newTrainee: Omit<Trainee, 'id' | 'calculated'>) => {
        const id = `t-${Date.now()}`;
        const calculated = calculateStats(newTrainee.metrics);
        const trainee: Trainee = { ...newTrainee, id, calculated };

        setTrainees(prev => [...prev, trainee]);
    };

    const updateTrainee = (id: string, updates: Partial<Trainee>) => {
        setTrainees(prev => prev.map(t => {
            if (t.id !== id) return t;

            const updated = { ...t, ...updates };
            // Recalculate if metrics changed
            if (updates.metrics) {
                updated.calculated = calculateStats(updated.metrics);
            }
            return updated;
        }));
    };

    const deleteTrainee = (id: string) => {
        setTrainees(prev => prev.filter(t => t.id !== id));
    };

    return (
        <TraineeContext.Provider value={{
            trainees,
            loading,
            error,
            addTrainee,
            updateTrainee,
            deleteTrainee,
            calculateStats
        }}>
            {children}
        </TraineeContext.Provider>
    );
};

export const useTrainee = (): TraineeContextType => {
    const context = useContext(TraineeContext);
    if (context === undefined) {
        throw new Error('useTrainee must be used within a TraineeProvider');
    }
    return context;
};
