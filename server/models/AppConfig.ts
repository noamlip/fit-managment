import mongoose from 'mongoose';
import { FoodItemSchema } from './FoodItem.js';

const AppConfigSchema = new mongoose.Schema({
    trainerName: { type: String, required: true, default: 'Trainer' },
    programName: { type: String, required: true, default: 'Fitness Program' },
    nutrition: {
        dailyPlan: [FoodItemSchema],
        mealTitles: {
            type: Map,
            of: String,
            default: {}
        }
    }
}, { timestamps: true });

export const AppConfig = mongoose.model('AppConfig', AppConfigSchema);
