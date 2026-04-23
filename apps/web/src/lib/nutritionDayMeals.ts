import type { FoodItem, Meal, NutritionPlan, Trainee } from '../types';

export type DayType = 'training' | 'rest';

function newMealId(): string {
    return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ensureMeals(source: Meal[] | undefined): Meal[] {
    if (Array.isArray(source) && source.length > 0) return source;
    return [{ id: newMealId(), title: 'Meal 1', items: [] }];
}

export function cloneMeals(meals: Meal[]): Meal[] {
    return meals.map((meal) => ({
        ...meal,
        items: meal.items.map((item) => ({ ...item })),
    }));
}

export function getDayTypeForDate(
    plan: NutritionPlan,
    trainee: Trainee | undefined,
    isoDate: string
): DayType {
    const manual = plan.dayTypes?.[isoDate];
    if (manual === 'rest' || manual === 'training') return manual;
    const workoutType = trainee?.schedule?.[isoDate]?.workoutType;
    return workoutType === 'rest' ? 'rest' : 'training';
}

/** Meals shown for a calendar day (per-day override or template by day type). */
export function getMealsForPlanDate(plan: NutritionPlan, isoDate: string, dayType: DayType): Meal[] {
    const perDay = plan.dayMeals?.[isoDate];
    if (Array.isArray(perDay) && perDay.length > 0) return cloneMeals(perDay);
    return dayType === 'rest'
        ? cloneMeals(ensureMeals(plan.restDayMeals ?? plan.meals))
        : cloneMeals(ensureMeals(plan.trainingDayMeals ?? plan.meals));
}

export function flattenFoodItems(meals: Meal[]): FoodItem[] {
    return meals.flatMap((m) => m.items);
}

export const NUTRITION_SHOPPING_DATE_KEY = 'nutrition_shopping_selected_date';

/** Parse leading number in quantity like "100g" or "2 scoops". */
export function tryScaleQuantityString(quantity: string, factor: number): string | null {
    const trimmed = quantity.trim();
    const m = trimmed.match(/^(\d+\.?\d*)\s*(.*)$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (!Number.isFinite(n)) return null;
    const scaled = n * factor;
    const rest = m[2].trim();
    const rounded = Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1).replace(/\.0$/, '');
    return rest ? `${rounded} ${rest}` : rounded;
}
