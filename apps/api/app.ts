import express, { type Request, type Response } from 'express';
import cors from 'cors';
import type { ExerciseCatalog, SaveTraineeRoutinesBody } from './types.js';
import { getExerciseCatalog, saveExerciseCatalog, updateTraineeRoutines } from './dataStore.js';

export function createApp(): express.Express {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/api/exercises', async (_req: Request, res: Response) => {
        try {
            const catalog = await getExerciseCatalog();
            res.status(200).json(catalog);
        } catch (err) {
            console.error('Error reading exercises:', err);
            res.status(500).json({ error: 'Failed to read exercises' });
        }
    });

    app.post('/api/exercises', async (req: Request<object, unknown, ExerciseCatalog>, res: Response) => {
        try {
            const newExercises = req.body;
            await saveExerciseCatalog(newExercises);
            console.log('Updated exercise catalog');
            res.status(200).json({ success: true });
        } catch (err) {
            console.error('Error saving exercises:', err);
            res.status(500).json({ error: 'Failed to save exercises' });
        }
    });

    app.post(
        '/api/trainees/routines',
        async (req: Request<object, unknown, SaveTraineeRoutinesBody>, res: Response) => {
            try {
                const { traineeId, routines } = req.body;
                if (!traineeId || !routines) {
                    res.status(400).json({ error: 'Missing traineeId or routines' });
                    return;
                }
                const result = await updateTraineeRoutines({ traineeId, routines });
                if (result === 'not_found') {
                    res.status(404).json({ error: 'Trainee not found' });
                    return;
                }
                console.log(`Updated routines for trainee ${traineeId}`);
                res.status(200).json({ success: true });
            } catch (err) {
                console.error('Error saving trainee routines:', err);
                res.status(500).json({ error: 'Failed to save trainee routines' });
            }
        }
    );

    return app;
}
