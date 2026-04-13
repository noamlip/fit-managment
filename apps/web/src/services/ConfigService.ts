import type { AppConfig, FoodItem, NutritionPlan } from '../types';

export const ConfigService = {
    async fetchConfig(): Promise<AppConfig> {
        const [trainerRes, nutritionRes, foodsRes] = await Promise.all([
            fetch('/data/trainer.json'),
            fetch('/data/nutrition.json'),
            fetch('/data/foods.json'),
        ]);
        if (!trainerRes.ok) throw new Error('Failed to load trainer config');
        if (!nutritionRes.ok) throw new Error('Failed to load nutrition');
        const trainer = (await trainerRes.json()) as { trainerName: string; programName: string };
        const nutritionWrap = (await nutritionRes.json()) as { nutrition: NutritionPlan };
        let foodDatabase: FoodItem[] | undefined;
        if (foodsRes.ok) {
            foodDatabase = (await foodsRes.json()) as FoodItem[];
        }
        return {
            trainerName: trainer.trainerName,
            programName: trainer.programName,
            nutrition: nutritionWrap.nutrition,
            foodDatabase,
        };
    },
};
