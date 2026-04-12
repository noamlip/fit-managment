import type { FeedbackAnswers, FeedbackQuestion } from '../types';

export type FeedbackSeverity = 'ok' | 'warning' | 'alert';

/**
 * Heuristic severity from post-workout answers (see `workout_feedback.json`).
 * q1: scale 1–10 (1 = too easy, 10 = too hard) — flag very low or very high as notable.
 * q3: emoji scale 1–5 (1 = lowest energy) — flag low values.
 * q5: text notes — any non-empty text counts as a note for the coach.
 */
function isSerializableFeedbackValue(v: unknown): v is string | number | boolean {
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

export function getWorkoutFeedbackSeverity(
    feedback: FeedbackAnswers | undefined,
    questions: FeedbackQuestion[]
): FeedbackSeverity {
    if (!feedback || Object.keys(feedback).length === 0) return 'ok';

    let worst: FeedbackSeverity = 'ok';

    for (const q of questions) {
        const v = feedback[q.id];
        if (v === undefined || v === '' || !isSerializableFeedbackValue(v)) continue;

        if (q.type === 'text' && typeof v === 'string' && v.trim().length > 0) {
            worst = bump(worst, 'warning');
        }

        if (q.type === 'scale' && q.id === 'q1') {
            const n = Number(v);
            if (!Number.isNaN(n) && (n <= 3 || n >= 9)) {
                worst = bump(worst, 'alert');
            }
        }

        if (q.type === 'emoji_scale' && q.id === 'q3') {
            const n = Number(v);
            if (!Number.isNaN(n) && n <= 2) {
                worst = bump(worst, 'alert');
            }
        }
    }

    return worst;
}

function bump(current: FeedbackSeverity, next: FeedbackSeverity): FeedbackSeverity {
    const rank: Record<FeedbackSeverity, number> = { ok: 0, warning: 1, alert: 2 };
    return rank[next] > rank[current] ? next : current;
}

export function feedbackHasTextNotes(feedback: FeedbackAnswers | undefined, questions: FeedbackQuestion[]): boolean {
    if (!feedback) return false;
    const textQs = questions.filter((q) => q.type === 'text');
    return textQs.some((q) => {
        const v = feedback[q.id];
        return isSerializableFeedbackValue(v) && typeof v === 'string' && v.trim().length > 0;
    });
}

export function formatFeedbackSummary(
    feedback: FeedbackAnswers | undefined,
    questions: FeedbackQuestion[]
): string {
    if (!feedback) return '';
    const parts: string[] = [];
    for (const q of questions) {
        const v = feedback[q.id];
        if (v === undefined || v === '' || v === null || !isSerializableFeedbackValue(v)) continue;
        if (q.type === 'text' && typeof v === 'string') {
            parts.push(`${q.text}: ${v}`);
        } else {
            parts.push(`${q.text}: ${String(v)}`);
        }
    }
    return parts.join(' · ');
}
