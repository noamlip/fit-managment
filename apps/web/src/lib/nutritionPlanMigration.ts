import type { FoodItem, LegacyNutritionPlan, Meal, NutritionPlan } from '../types';

function newMealId(): string {
    return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cloneMeals(meals: Meal[]): Meal[] {
    return meals.map((meal) => ({
        ...meal,
        items: meal.items.map((item) => ({ ...item })),
    }));
}

/** Normalize localStorage / API JSON into `{ meals }`. */
export function migrateNutritionPlan(raw: unknown): NutritionPlan {
    if (!raw || typeof raw !== 'object') {
        const fallbackMeals = [{ id: newMealId(), title: 'Meal 1', items: [] }];
        return {
            meals: fallbackMeals,
            trainingDayMeals: cloneMeals(fallbackMeals),
            restDayMeals: cloneMeals(fallbackMeals),
            dayTypes: {},
            dayMeals: {},
        };
    }

    const o = raw as LegacyNutritionPlan;

    if (Array.isArray(o.meals) && o.meals.length > 0) {
        const meals: Meal[] = o.meals.map((m, i) => ({
            id: typeof m.id === 'string' ? m.id : newMealId(),
            title: typeof m.title === 'string' && m.title.trim() ? m.title : `Meal ${i + 1}`,
            items: Array.isArray(m.items) ? (m.items as FoodItem[]) : [],
        }));
        const next = o as NutritionPlan;
        return {
            meals,
            trainingDayMeals:
                Array.isArray(next.trainingDayMeals) && next.trainingDayMeals.length > 0
                    ? cloneMeals(next.trainingDayMeals)
                    : cloneMeals(meals),
            restDayMeals:
                Array.isArray(next.restDayMeals) && next.restDayMeals.length > 0
                    ? cloneMeals(next.restDayMeals)
                    : cloneMeals(meals),
            dayTypes: next.dayTypes && typeof next.dayTypes === 'object' ? { ...next.dayTypes } : {},
            dayMeals:
                next.dayMeals && typeof next.dayMeals === 'object'
                    ? Object.fromEntries(
                          Object.entries(next.dayMeals).map(([date, dateMeals]) => [
                              date,
                              cloneMeals(Array.isArray(dateMeals) ? dateMeals : []),
                          ])
                      )
                    : {},
        };
    }

    const daily = o.dailyPlan;
    if (Array.isArray(daily) && daily.length > 0) {
        const meals = [
            {
                id: newMealId(),
                title: 'Daily plan',
                items: daily as FoodItem[],
            },
        ];
        return {
            meals,
            trainingDayMeals: cloneMeals(meals),
            restDayMeals: cloneMeals(meals),
            dayTypes: {},
            dayMeals: {},
        };
    }

    const fallbackMeals = [{ id: newMealId(), title: 'Meal 1', items: [] }];
    return {
        meals: fallbackMeals,
        trainingDayMeals: cloneMeals(fallbackMeals),
        restDayMeals: cloneMeals(fallbackMeals),
        dayTypes: {},
        dayMeals: {},
    };
}
