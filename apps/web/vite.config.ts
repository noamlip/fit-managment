import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Set in CI for GitHub Pages previews (must include leading `/` and trailing `/`). */
function pagesBase(): string {
    const raw = process.env.GITHUB_PAGES_BASE?.trim();
    if (!raw) return '/';
    const withSlash = raw.endsWith('/') ? raw : `${raw}/`;
    return withSlash.startsWith('/') ? withSlash : `/${withSlash}`;
}

export default defineConfig({
    base: pagesBase(),
    plugins: [react()],
    root: '.',
    publicDir: 'public',
});
