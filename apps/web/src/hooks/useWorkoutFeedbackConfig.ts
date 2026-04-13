import { useEffect, useState } from 'react';
import type { FeedbackQuestion, WorkoutFeedbackFile } from '../types';

const FEEDBACK_URL = '/data/workout_feedback.json';

let cache: FeedbackQuestion[] | null = null;
let inflight: Promise<FeedbackQuestion[]> | null = null;

async function loadQuestions(): Promise<FeedbackQuestion[]> {
    if (cache !== null) return cache;
    if (inflight !== null) return inflight;
    inflight = (async () => {
        const res = await fetch(FEEDBACK_URL);
        if (!res.ok) throw new Error(`Failed to load workout feedback: ${res.statusText}`);
        const data = (await res.json()) as WorkoutFeedbackFile;
        cache = data.questions;
        return cache;
    })();
    try {
        return await inflight;
    } finally {
        inflight = null;
    }
}

export interface UseWorkoutFeedbackConfigResult {
    questions: FeedbackQuestion[];
    loading: boolean;
    error: Error | null;
}

export function useWorkoutFeedbackConfig(): UseWorkoutFeedbackConfigResult {
    const [questions, setQuestions] = useState<FeedbackQuestion[]>(() => cache ?? []);
    const [loading, setLoading] = useState(() => cache === null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (cache !== null) return;
        setLoading(true);
        loadQuestions()
            .then((q) => {
                if (!cancelled) {
                    setQuestions(q);
                    setError(null);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(err instanceof Error ? err : new Error('Unknown'));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return { questions, loading, error };
}
