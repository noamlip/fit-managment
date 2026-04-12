import express, { type Request, type Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import type { ExerciseCatalog, SaveTraineeRoutinesBody, TraineeRecord } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '..', 'web', 'public', 'data');

async function readJson<T>(filename: string): Promise<T> {
    const filePath = path.join(DATA_DIR, filename);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as T;
    } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? (err as NodeJS.ErrnoException).code : undefined;
        if (code === 'ENOENT') {
            return [] as unknown as T;
        }
        throw err;
    }
}

async function writeJson(filename: string, data: unknown): Promise<void> {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
}

app.post('/api/exercises', async (req: Request<object, unknown, ExerciseCatalog>, res: Response) => {
    try {
        const newExercises = req.body;
        await writeJson('exercises.json', newExercises);
        console.log('Updated exercises.json');
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

            const trainees = await readJson<TraineeRecord[]>('trainees.json');
            const index = trainees.findIndex((t) => t.id === traineeId);

            if (index !== -1) {
                trainees[index] = { ...trainees[index], routines };
                await writeJson('trainees.json', trainees);
                console.log(`Updated routines for trainee ${traineeId}`);
                res.status(200).json({ success: true });
            } else {
                res.status(404).json({ error: 'Trainee not found' });
            }
        } catch (err) {
            console.error('Error saving trainee routines:', err);
            res.status(500).json({ error: 'Failed to save trainee routines' });
        }
    }
);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
