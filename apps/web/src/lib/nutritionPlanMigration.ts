import type { FoodItem, LegacyNutritionPlan, Meal, NutritionPlan } from '../types';

function newMealId(): string {
    return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Normalize localStorage / API JSON into `{ meals }`. */
export function migrateNutritionPlan(raw: unknown): NutritionPlan {
    if (!raw || typeof raw !== 'object') {
        return { meals: [{ id: newMealId(), title: 'Meal 1', items: [] }] };
    }

    const o = raw as LegacyNutritionPlan;

    if (Array.isArray(o.meals) && o.meals.length > 0) {
        const meals: Meal[] = o.meals.map((m, i) => ({
            id: typeof m.id === 'string' ? m.id : newMealId(),
            title: typeof m.title === 'string' && m.title.trim() ? m.title : `Meal ${i + 1}`,
            items: Array.isArray(m.items) ? (m.items as FoodItem[]) : [],
        }));
        return { meals };
    }

    const daily = o.dailyPlan;
    if (Array.isArray(daily) && daily.length > 0) {
        return {
            meals: [
                {
                    id: newMealId(),
                    title: 'Daily plan',
                    items: daily as FoodItem[],
                },
            ],
        };
    }

    return { meals: [{ id: newMealId(), title: 'Meal 1', items: [] }] };
}
