import type { ExerciseCatalog } from '../types';
import { apiBase } from './apiBase';

export async function saveExerciseCatalog(catalog: ExerciseCatalog): Promise<void> {
    const res = await fetch(`${apiBase()}/api/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catalog),
    });
    if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Save exercise library failed (${res.status})`);
    }
}
