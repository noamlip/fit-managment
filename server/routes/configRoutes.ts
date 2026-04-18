import express from 'express';
import { AppConfig } from '../models/AppConfig.js';

const router = express.Router();

// GET config (Trainer info)
router.get('/', async (req, res) => {
    try {
        let config = await AppConfig.findOne();
        if (!config) {
            config = await AppConfig.create({
                trainerName: 'Default Trainer',
                programName: 'Default Program',
                nutrition: { dailyPlan: [], mealTitles: {} }
            });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT config
router.put('/', async (req, res) => {
    try {
        const { trainerName, programName, nutrition } = req.body;
        let config = await AppConfig.findOne();

        if (!config) {
            config = new AppConfig({ trainerName, programName, nutrition });
        } else {
            config.trainerName = trainerName || config.trainerName;
            config.programName = programName || config.programName;
            config.nutrition = nutrition || config.nutrition;
        }

        const updatedConfig = await config.save();
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
