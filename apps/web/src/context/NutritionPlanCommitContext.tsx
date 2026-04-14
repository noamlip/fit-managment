import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    type ReactNode,
} from 'react';
import type { NutritionPlan } from '../types';
import { useConfig } from './ConfigContext';
import { useTrainee } from './TraineeContext';

interface NutritionPlanCommitContextType {
    commitPlan: (plan: NutritionPlan) => void;
}

const NutritionPlanCommitContext = createContext<NutritionPlanCommitContextType | undefined>(
    undefined
);

export const NutritionPlanCommitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { updatePlan, userRole, trainerName, selectedTrainee } = useConfig();
    const { trainees, updateTrainee } = useTrainee();

    const commitPlan = useCallback(
        (plan: NutritionPlan) => {
            updatePlan(plan);
            if (userRole === 'trainer' && trainerName) {
                const t = trainees.find((tr) => tr.name === trainerName);
                if (t) {
                    updateTrainee(t.id, {
                        nutritionPendingCoachReview: true,
                        nutritionLastEditedByTraineeAt: new Date().toISOString(),
                    });
                }
            } else if (userRole === 'coach' && selectedTrainee) {
                const t = trainees.find((tr) => tr.name === selectedTrainee);
                if (t) {
                    updateTrainee(t.id, {
                        nutritionPendingCoachReview: false,
                        nutritionLastEditedByTraineeAt: undefined,
                    });
                }
            }
        },
        [updatePlan, userRole, trainerName, selectedTrainee, trainees, updateTrainee]
    );

    const value = useMemo(() => ({ commitPlan }), [commitPlan]);

    return (
        <NutritionPlanCommitContext.Provider value={value}>{children}</NutritionPlanCommitContext.Provider>
    );
};

export const useNutritionPlanCommit = (): NutritionPlanCommitContextType => {
    const ctx = useContext(NutritionPlanCommitContext);
    if (!ctx) {
        throw new Error('useNutritionPlanCommit must be used within NutritionPlanCommitProvider');
    }
    return ctx;
};
