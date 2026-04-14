import type { ExerciseCatalog } from '../types';

function apiBase(): string {
    const env = import.meta.env.VITE_API_BASE_URL;
    if (typeof env === 'string' && env.trim()) {
        return env.replace(/\/$/, '');
    }
    return 'http://localhost:3001';
}

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
