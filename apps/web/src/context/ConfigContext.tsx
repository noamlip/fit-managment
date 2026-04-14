import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { AppConfig, FoodItem, NutritionPlan, UserRole } from '../types';
import { ConfigService } from '../services/ConfigService';
import { migrateNutritionPlan } from '../lib/nutritionPlanMigration';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [trainerName, setTrainerName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<NutritionPlan | null>(null);
    const [knownTrainers, setKnownTrainers] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await ConfigService.fetchConfig();
                if (!cancelled) setBaseConfig(data);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e : new Error('Config load failed'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('known_trainers');
            if (stored) setKnownTrainers(JSON.parse(stored) as string[]);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        if (!trainerName || !baseConfig) {
            setCurrentPlan(null);
            return;
        }
        if (userRole === 'coach' && !selectedTrainee) {
            setCurrentPlan(null);
            return;
        }
        const traineeKey = userRole === 'trainer' ? trainerName : selectedTrainee;
        if (!traineeKey) return;
        const saved = localStorage.getItem(`nutrition_plan_${traineeKey}`);
        if (saved) {
            try {
                setCurrentPlan(migrateNutritionPlan(JSON.parse(saved)));
            } catch {
                setCurrentPlan(baseConfig.nutrition);
            }
        } else {
            setCurrentPlan(baseConfig.nutrition);
        }
    }, [trainerName, userRole, selectedTrainee, baseConfig]);

    const login = useCallback((name: string, role: UserRole) => {
        setTrainerName(name);
        setUserRole(role);
        if (role === 'trainer') {
            setSelectedTrainee(name);
            setKnownTrainers((prev) => {
                if (prev.includes(name)) return prev;
                const next = [name, ...prev];
                localStorage.setItem('known_trainers', JSON.stringify(next));
                return next;
            });
        } else {
            setSelectedTrainee(null);
        }
    }, []);

    const logout = useCallback(() => {
        setTrainerName(null);
        setUserRole(null);
        setSelectedTrainee(null);
    }, []);

    const selectTrainee = useCallback(
        (name: string) => {
            if (userRole === 'coach') setSelectedTrainee(name);
        },
        [userRole]
    );

    const removeTrainer = useCallback((name: string) => {
        setKnownTrainers((prev) => {
            const next = prev.filter((t) => t !== name);
            localStorage.setItem('known_trainers', JSON.stringify(next));
            return next;
        });
        setSelectedTrainee((prev) => (prev === name ? null : prev));
    }, []);

    const updatePlan = useCallback(
        (newPlan: NutritionPlan) => {
            const target = userRole === 'trainer' ? trainerName : selectedTrainee;
            if (!target) return;
            setCurrentPlan(newPlan);
            localStorage.setItem(`nutrition_plan_${target}`, JSON.stringify(newPlan));
        },
        [trainerName, userRole, selectedTrainee]
    );

    const activeConfig = useMemo(
        () =>
            baseConfig && currentPlan
                ? {
                      ...baseConfig,
                      nutrition: currentPlan,
                      trainerName: selectedTrainee || trainerName || baseConfig.trainerName,
                  }
                : baseConfig,
        [baseConfig, currentPlan, selectedTrainee, trainerName]
    );

    const foodDatabase = useMemo(() => baseConfig?.foodDatabase ?? [], [baseConfig]);

    const value = useMemo<ConfigContextType>(
        () => ({
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
            removeTrainer,
            updatePlan,
            selectTrainee,
        }),
        [
            activeConfig,
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
            removeTrainer,
            updatePlan,
            selectTrainee,
        ]
    );

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = (): ConfigContextType => {
    const ctx = useContext(ConfigContext);
    if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
    return ctx;
};
