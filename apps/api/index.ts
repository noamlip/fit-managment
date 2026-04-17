/**
 * Firebase Cloud Functions entry (compiled to lib/index.js).
 */
import 'reflect-metadata';
import { onRequest } from 'firebase-functions/v2/https';
import { getApiHandler } from './src/cloud-functions';

const region = process.env.FUNCTION_REGION || 'us-central1';

// Express 5 handler types differ from firebase-functions' bundled @types/express; runtime is compatible.
export const api = onRequest({ region, cors: false, invoker: 'public' }, getApiHandler() as never);
