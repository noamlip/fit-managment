import mongoose from 'mongoose';

export const FoodItemSchema = new mongoose.Schema({
    item: { type: String, required: true },
    quantity: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
}, { strict: false, timestamps: true });

export const FoodItem = mongoose.model('FoodItem', FoodItemSchema);
