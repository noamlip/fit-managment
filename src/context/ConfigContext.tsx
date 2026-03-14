import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppConfig, NutritionPlan, FoodItem, UserRole } from '../types';
import { ConfigService } from '../services/ConfigService';

interface ConfigContextType {
    config: AppConfig | null;
    loading: boolean;
    error: Error | null;
    trainerName: string | null;
    userRole: UserRole | null;
    selectedTrainee: string | null;
    currentPlan: NutritionPlan | null;
    foodDatabase: FoodItem[];
    knownTrainers: string[];
    login: (name: string, role: UserRole) => void;
    logout: () => void;
    removeTrainer: (name: string) => void;
    updatePlan: (newPlan: NutritionPlan) => void;
    selectTrainee: (name: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [baseConfig, setBaseConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Trainer State
    const [trainerName, setTrainerName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<NutritionPlan | null>(null);
    const [knownTrainers, setKnownTrainers] = useState<string[]>([]);

    // Load Base Config
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await ConfigService.fetchConfig();
                setBaseConfig(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    // Load Known Trainers
    useEffect(() => {
        try {
            const stored = localStorage.getItem('known_trainers');
            if (stored) {
                setKnownTrainers(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load known trainers', e);
        }
    }, []);

    // Sync Plan on Trainer Login or Selection
    useEffect(() => {
        if (!trainerName || !baseConfig) {
            setCurrentPlan(null);
            return;
        }

        // If coach has not selected a trainee, clear plan
        if (userRole === 'coach' && !selectedTrainee) {
            setCurrentPlan(null);
            return;
        }

        const traineeKey = userRole === 'trainer' ? trainerName : selectedTrainee;
        if (!traineeKey) return;

        const savedPlan = localStorage.getItem(`nutrition_plan_${traineeKey}`);
        if (savedPlan) {
            try {
                setCurrentPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error("Failed to parse saved plan, using default", e);
                setCurrentPlan(baseConfig.nutrition);
            }
        } else {
            // Initialize with default plan
            setCurrentPlan(baseConfig.nutrition);
        }
    }, [trainerName, userRole, selectedTrainee, baseConfig]);

    const login = (name: string, role: UserRole) => {
        setTrainerName(name);
        setUserRole(role);

        if (role === 'trainer') {
            // Trainer implicitly selects themself
            setSelectedTrainee(name);

            setKnownTrainers(prev => {
                if (!prev.includes(name)) {
                    // add to history
                    const updated = [name, ...prev];
                    localStorage.setItem('known_trainers', JSON.stringify(updated));
                    return updated;
                }
                return prev;
            });
        } else {
            // Coach starts with no selection
            setSelectedTrainee(null);
        }
    };

    const logout = () => {
        setTrainerName(null);
        setUserRole(null);
        setSelectedTrainee(null);
    };

    const selectTrainee = (name: string) => {
        if (userRole === 'coach') {
            setSelectedTrainee(name);
        }
    };

    const removeTrainer = (name: string) => {
        setKnownTrainers(prev => {
            const updated = prev.filter(t => t !== name);
            localStorage.setItem('known_trainers', JSON.stringify(updated));
            return updated;
        });
        if (selectedTrainee === name) setSelectedTrainee(null);
    };

    const updatePlan = (newPlan: NutritionPlan) => {
        // Must have a valid target
        const target = userRole === 'trainer' ? trainerName : selectedTrainee;
        if (!target) return;

        setCurrentPlan(newPlan);
        localStorage.setItem(`nutrition_plan_${target}`, JSON.stringify(newPlan));
    };

    // Merge current plan into the exposed config object
    // If coach has selected a trainee, `currentPlan` is that trainee's plan.
    // If coach has NOT selected, `currentPlan` is null -> no nutrition config exposed.
    const activeConfig = baseConfig && currentPlan
        ? { ...baseConfig, nutrition: currentPlan, trainerName: selectedTrainee || trainerName || baseConfig.trainerName }
        : baseConfig;

    // Expose food DB specifically
    const foodDatabase = baseConfig?.foodDatabase || [];

    return (
        <ConfigContext.Provider value={{
            config: activeConfig,
            loading,
            error,
            trainerName,
            userRole,
            selectedTrainee,
            currentPlan,
            foodDatabase,
            knownTrainers,
            login,
            logout,
            selectTrainee,
            removeTrainer,
            updatePlan
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextType => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
