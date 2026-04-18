import express from 'express';
import { Trainee } from '../models/Trainee.js';
import { AppConfig } from '../models/AppConfig.js';

const router = express.Router();

// GET all trainees
router.get('/', async (req, res) => {
    try {
        const trainees = await Trainee.find().populate('trainerId', 'trainerName programName');
        res.json(trainees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET single trainee
router.get('/:id', async (req, res) => {
    try {
        const trainee = await Trainee.findById(req.params.id).populate('trainerId', 'trainerName programName');
        if (!trainee) {
            return res.status(404).json({ message: 'Trainee not found' });
        }
        res.json(trainee);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST add new trainee
router.post('/', async (req, res) => {
    try {
        // Automatically link to the main trainer if not provided
        let trainerId = req.body.trainerId;
        if (!trainerId) {
            const config = await AppConfig.findOne();
            if (config) {
                trainerId = config._id;
            }
        }

        const newTrainee = new Trainee({ ...req.body, trainerId });
        const savedTrainee = await newTrainee.save();
        res.status(201).json(savedTrainee);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update trainee
router.put('/:id', async (req, res) => {
    try {
        const updatedTrainee = await Trainee.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated object
            runValidators: true // Run schema validations on update
        });

        if (!updatedTrainee) {
            return res.status(404).json({ message: 'Trainee not found' });
        }
        res.json(updatedTrainee);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE trainee
router.delete('/:id', async (req, res) => {
    try {
        const trainee = await Trainee.findByIdAndDelete(req.params.id);
        if (!trainee) {
            return res.status(404).json({ message: 'Trainee not found' });
        }
        res.json({ message: 'Trainee removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
