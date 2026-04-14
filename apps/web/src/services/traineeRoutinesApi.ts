import type { SaveTraineeRoutinesRequestBody } from '../types';
import { apiBase } from './apiBase';

export async function saveTraineeRoutines(body: SaveTraineeRoutinesRequestBody): Promise<void> {
    const res = await fetch(`${apiBase()}/api/trainees/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Save routines failed (${res.status})`);
    }
}
