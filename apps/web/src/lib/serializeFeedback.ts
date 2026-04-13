import type { FeedbackAnswers, FeedbackAnswerValue } from '../types';

/** Strip File objects for JSON/localStorage persistence */
export function serializeFeedbackForStorage(answers: FeedbackAnswers): Record<string, FeedbackAnswerValue> {
    const out: Record<string, FeedbackAnswerValue> = {};
    for (const [k, v] of Object.entries(answers)) {
        if (v instanceof File) continue;
        out[k] = v;
    }
    return out;
}
