/**
 * Firebase Cloud Functions entry (compiled to lib/index.js).
 */
import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';
import { createApp } from './app.js';

const app = createApp();

const region = process.env.FUNCTION_REGION || 'us-central1';

export const api = onRequest({ region, cors: false, invoker: 'public' }, (req, res) => {
    void app(req as unknown as Request, res as unknown as Response);
});
