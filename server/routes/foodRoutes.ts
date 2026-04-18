import express from 'express';
import { FoodItem } from '../models/FoodItem.js';

const router = express.Router();

// GET all food items
router.get('/', async (req, res) => {
    try {
        const foods = await FoodItem.find();
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST add new food item
router.post('/', async (req, res) => {
    try {
        const newFood = new FoodItem(req.body);
        const savedFood = await newFood.save();
        res.status(201).json(savedFood);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
