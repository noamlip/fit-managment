import type { SaveTraineeRoutinesRequestBody } from '../types';

function apiBase(): string {
    const env = import.meta.env.VITE_API_BASE_URL;
    if (typeof env === 'string' && env.trim()) {
        return env.replace(/\/$/, '');
    }
    return 'http://localhost:3001';
}

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
