/**
 * Production builds set `VITE_API_BASE_URL` to empty so requests use same-origin `/api/...`.
 * When the variable is unset (local Vite), default to the local API server.
 */
export function apiBase(): string {
    const env = import.meta.env.VITE_API_BASE_URL;
    if (typeof env === 'string') {
        const trimmed = env.trim();
        if (trimmed !== '') {
            return trimmed.replace(/\/$/, '');
        }
        return '';
    }
    return 'http://localhost:3001';
}
