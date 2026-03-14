import { useMemo } from 'react';
import type { NutritionPlan } from '../types';

interface NutritionTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    [key: string]: number;
}

export const useNutrition = (nutrition: NutritionPlan | undefined) => {
    const totals = useMemo(() => {
        if (!nutrition || !nutrition.dailyPlan) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 } as NutritionTotals;
        }

        return nutrition.dailyPlan.reduce(
            (acc, item) => {
                const newAcc = { ...acc };
                // Calculate standard macros
                newAcc.calories += item.calories || 0;
                newAcc.protein += item.protein || 0;
                newAcc.carbs += item.carbs || 0;
                newAcc.fat += item.fat || 0;

                // Calculate any other numeric properties (Open/Closed)
                Object.keys(item).forEach((key) => {
                    if (
                        key !== 'id' &&
                        key !== 'item' &&
                        key !== 'quantity' &&
                        typeof item[key] === 'number' &&
                        !['calories', 'protein', 'carbs', 'fat'].includes(key)
                    ) {
                        newAcc[key] = (newAcc[key] || 0) + (item[key] as number);
                    }
                });

                return newAcc;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 } as NutritionTotals
        );
    }, [nutrition]);

    return { totals };
};
