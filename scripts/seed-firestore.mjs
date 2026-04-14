#!/usr/bin/env node
/**
 * One-off seed: reads apps/web/public/data JSON and writes Firestore.
 * Run from repo root with credentials, e.g.:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json node scripts/seed-firestore.mjs
 */
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'apps', 'web', 'public', 'data');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const CONFIG_COLLECTION = 'config';
const CATALOG_DOC_ID = 'catalog';
const PARTS_FIELD = 'parts';
const TRAINEES_COLLECTION = 'trainees';

async function main() {
    const exercisesRaw = await readFile(join(dataDir, 'exercises.json'), 'utf-8');
    const parts = JSON.parse(exercisesRaw);

    const traineesRaw = await readFile(join(dataDir, 'trainees.json'), 'utf-8');
    const trainees = JSON.parse(traineesRaw);

    if (!trainees || !Array.isArray(trainees)) {
        throw new Error('trainees.json must be a JSON array');
    }

    await db.collection(CONFIG_COLLECTION).doc(CATALOG_DOC_ID).set({
        [PARTS_FIELD]: parts,
        updatedAt: new Date().toISOString(),
    });

    const batch = db.batch();
    for (const t of trainees) {
        if (!t || typeof t.id !== 'string') continue;
        const ref = db.collection(TRAINEES_COLLECTION).doc(t.id);
        batch.set(ref, t, { merge: true });
    }
    await batch.commit();

    console.log(`Seeded catalog at ${CONFIG_COLLECTION}/${CATALOG_DOC_ID} and ${trainees.length} trainees.`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
