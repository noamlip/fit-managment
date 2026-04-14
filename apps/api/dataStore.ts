import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ExerciseCatalog, SaveTraineeRoutinesBody, TraineeRecord } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Firestore: config/catalog doc, field `parts` = ExerciseCatalog */
const CONFIG_COLLECTION = 'config';
const CATALOG_DOC_ID = 'catalog';
const PARTS_FIELD = 'parts';

const TRAINEES_COLLECTION = 'trainees';

export function useFirestore(): boolean {
    if (process.env.USE_FIRESTORE === 'false') return false;
    if (process.env.USE_FIRESTORE === 'true') return true;
    return Boolean(process.env.K_SERVICE || process.env.FUNCTION_NAME || process.env.FUNCTION_TARGET);
}

function fsDataDir(): string {
    return path.join(__dirname, '..', '..', 'web', 'public', 'data');
}

async function readJsonFile<T>(filename: string): Promise<T> {
    const filePath = path.join(fsDataDir(), filename);
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

async function writeJsonFile(filename: string, data: unknown): Promise<void> {
    const filePath = path.join(fsDataDir(), filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
}

async function getFirestore() {
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin.firestore();
}

function catalogFromFirestoreData(data: Record<string, unknown> | undefined): ExerciseCatalog {
    if (!data || typeof data !== 'object') return {};
    const parts = data[PARTS_FIELD];
    if (!parts || typeof parts !== 'object') return {};
    return parts as ExerciseCatalog;
}

export async function getExerciseCatalog(): Promise<ExerciseCatalog> {
    if (useFirestore()) {
        const db = await getFirestore();
        const snap = await db.collection(CONFIG_COLLECTION).doc(CATALOG_DOC_ID).get();
        return catalogFromFirestoreData(snap.data() as Record<string, unknown> | undefined);
    }
    const raw = await readJsonFile<ExerciseCatalog | unknown>('exercises.json');
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return raw as ExerciseCatalog;
    }
    return {};
}

export async function saveExerciseCatalog(catalog: ExerciseCatalog): Promise<void> {
    if (useFirestore()) {
        const db = await getFirestore();
        await db.collection(CONFIG_COLLECTION).doc(CATALOG_DOC_ID).set(
            {
                [PARTS_FIELD]: catalog,
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );
        return;
    }
    await writeJsonFile('exercises.json', catalog);
}

export async function updateTraineeRoutines(body: SaveTraineeRoutinesBody): Promise<'ok' | 'not_found'> {
    const { traineeId, routines } = body;
    if (useFirestore()) {
        const db = await getFirestore();
        const ref = db.collection(TRAINEES_COLLECTION).doc(traineeId);
        const snap = await ref.get();
        if (!snap.exists) return 'not_found';
        await ref.set({ routines, updatedAt: new Date().toISOString() }, { merge: true });
        return 'ok';
    }
    const trainees = await readJsonFile<TraineeRecord[]>('trainees.json');
    if (!Array.isArray(trainees)) {
        return 'not_found';
    }
    const index = trainees.findIndex((t) => t.id === traineeId);
    if (index === -1) return 'not_found';
    trainees[index] = { ...trainees[index], routines };
    await writeJsonFile('trainees.json', trainees);
    return 'ok';
}
