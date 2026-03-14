import type { AppConfig } from '../types';

export class ConfigService {
    private static trainerUrl = '/data/trainer.json';
    private static nutritionUrl = '/data/nutrition.json';
    private static foodsUrl = '/data/foods.json';

    static async fetchConfig(): Promise<AppConfig> {
        try {
            const [trainerRes, nutritionRes, foodsRes] = await Promise.all([
                fetch(this.trainerUrl),
                fetch(this.nutritionUrl),
                fetch(this.foodsUrl)
            ]);

            if (!trainerRes.ok) throw new Error(`Failed to load trainer config: ${trainerRes.statusText}`);
            if (!nutritionRes.ok) throw new Error(`Failed to load nutrition config: ${nutritionRes.statusText}`);
            if (!foodsRes.ok) throw new Error(`Failed to load foods DB: ${foodsRes.statusText}`);

            const trainerData = await trainerRes.json();
            const nutritionData = await nutritionRes.json();
            const foodsData = await foodsRes.json();

            return { ...trainerData, ...nutritionData, foodDatabase: foodsData } as AppConfig;
        } catch (error) {
            console.error('Error fetching config:', error);
            throw error;
        }
    }
}
