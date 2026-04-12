import React, { useMemo } from 'react';
import { AssignmentControls } from './AssignmentControls';
import type { Trainee, WorkoutType, FeedbackAnswers, FeedbackAnswerValue, WorkoutSessionLog } from '../../types';
import { type IDayInfo, ScheduleCalendar } from './ScheduleCalendar';
import { useWorkoutFeedbackConfig } from '../../hooks/useWorkoutFeedbackConfig';
import {
    formatFeedbackSummary,
    getWorkoutFeedbackSeverity,
    type FeedbackSeverity,
} from '../../lib/workoutFeedbackDisplay';
import './WorkoutsTab.scss';

interface IWorkoutsTabProps {
    trainee: Trainee;
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
    onAssign: (type: WorkoutType) => void;
    onMarkFeedbackSeen: () => void;
}

function toSerializableFeedback(raw?: Record<string, FeedbackAnswerValue>): FeedbackAnswers | undefined {
    if (!raw) return undefined;
    const out: FeedbackAnswers = {};
    for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            out[k] = v;
        }
    }
    return Object.keys(out).length ? out : undefined;
}

function formatDuration(sec: number | undefined): string {
    if (sec == null || sec < 0) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
}

function SessionLogReadonly({ log, dateLabel }: { log: WorkoutSessionLog; dateLabel: string }) {
    const complete = Boolean(log.endedAt);
    return (
        <div className="coach-session-log">
            <h4>
                Guided session — {dateLabel}
                {!complete && <span className="session-in-progress"> In progress</span>}
            </h4>
            {complete && (
                <p className="session-meta">
                    Duration {formatDuration(log.totalElapsedSeconds)} · Started{' '}
                    {new Date(log.startedAt).toLocaleString()} · Ended {new Date(log.endedAt!).toLocaleString()}
                </p>
            )}
            {!complete && (
                <p className="session-meta">Started {new Date(log.startedAt).toLocaleString()} (draft)</p>
            )}
            {log.restExtensions && log.restExtensions.length > 0 && (
                <div className="session-rest-extensions">
                    <strong>Extra rest</strong>
                    <ul>
                        {log.restExtensions.map((ev, i) => (
                            <li key={i}>
                                +{ev.addedSeconds}s at {formatDuration(ev.atElapsedSeconds)} elapsed
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="session-exercises">
                {log.exercises.map((ex) => (
                    <div key={ex.exerciseId} className="session-ex-block">
                        <div className="session-ex-name">
                            {ex.name} <span className="muted">({ex.sets.length}/{ex.plannedSets} sets logged)</span>
                        </div>
                        {ex.sets.length > 0 && (
                            <table className="session-sets-table">
                                <thead>
                                    <tr>
                                        <th>Set</th>
                                        <th>Weight (kg)</th>
                                        <th>Reps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ex.sets.map((s) => (
                                        <tr key={s.setIndex}>
                                            <td>{s.setIndex}</td>
                                            <td>{s.weightKg != null ? s.weightKg : '—'}</td>
                                            <td>{s.repsCompleted ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function scheduleEntryHasFeedback(feedback?: Record<string, FeedbackAnswerValue>): boolean {
    if (!feedback) return false;
    return Object.values(feedback).some((v) => {
        if (v instanceof File) return true;
        if (typeof v === 'string') return v.trim().length > 0;
        return typeof v === 'number' || typeof v === 'boolean';
    });
}

export const WorkoutsTab: React.FC<IWorkoutsTabProps> = ({
    trainee,
    selectedDate,
    onDateSelect,
    onAssign,
    onMarkFeedbackSeen,
}) => {
    const { questions } = useWorkoutFeedbackConfig();

    const weekDays: IDayInfo[] = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const scheduled = trainee.schedule?.[dateStr];

            return {
                date: d,
                dateStr,
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                day: d.getDate(),
                workout: scheduled?.workoutType
                    ? scheduled.workoutType.charAt(0).toUpperCase() + scheduled.workoutType.slice(1)
                    : 'Rest',
                status: scheduled?.status || 'pending',
                isSelected: dateStr === selectedDate,
            };
        });
    }, [trainee.schedule, selectedDate]);

    const lastSevenDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const scheduled = trainee.schedule?.[dateStr];
            const isRest = !scheduled || scheduled.workoutType === 'rest';
            const completed = scheduled?.status === 'completed';
            let tone: 'neutral' | 'done' | 'missed' = 'neutral';
            if (!isRest) {
                tone = completed ? 'done' : 'missed';
            }
            return {
                dateStr,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate(),
                tone,
            };
        });
    }, [trainee.schedule]);

    const lastSeenDay = trainee.coachLastSeenWorkoutFeedbackAt?.split('T')[0] ?? '';

    const newFeedbackCount = useMemo(() => {
        let n = 0;
        for (const [dateStr, day] of Object.entries(trainee.schedule || {})) {
            if (day.status !== 'completed' || !scheduleEntryHasFeedback(day.feedback)) continue;
            if (dateStr > lastSeenDay) n += 1;
        }
        return n;
    }, [trainee.schedule, lastSeenDay]);

    const feedbackRows = useMemo(() => {
        const rows: {
            dateStr: string;
            severity: FeedbackSeverity;
            summary: string;
        }[] = [];
        for (const [dateStr, day] of Object.entries(trainee.schedule || {})) {
            if (day.status !== 'completed' || !day.feedback) continue;
            const fb = toSerializableFeedback(day.feedback);
            if (!fb) continue;
            const severity = getWorkoutFeedbackSeverity(fb, questions);
            if (severity === 'ok' && !formatFeedbackSummary(fb, questions)) continue;
            rows.push({
                dateStr,
                severity,
                summary: formatFeedbackSummary(fb, questions) || 'Feedback submitted.',
            });
        }
        rows.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
        return rows.slice(0, 12);
    }, [trainee.schedule, questions]);

    const sevLabel = (s: FeedbackSeverity) => {
        if (s === 'alert') return 'Needs attention';
        if (s === 'warning') return 'Note';
        return 'Logged';
    };

    const selectedDayLog =
        selectedDate && trainee.schedule?.[selectedDate]?.sessionLog
            ? trainee.schedule[selectedDate]!.sessionLog!
            : null;

    return (
        <div className="workouts-tab-coach">
            <div className="retro-strip-wrap">
                <h4>Last 7 days (completion)</h4>
                <div className="retro-strip">
                    {lastSevenDays.map((d) => (
                        <div key={d.dateStr} className={`retro-day ${d.tone}`}>
                            <div className="dot" title={d.dateStr} />
                            <span className="lbl">{d.label}</span>
                            <span className="num">{d.dayNum}</span>
                        </div>
                    ))}
                </div>
                <div className="retro-legend">
                    <span>
                        <i className="lg g" /> Completed workout
                    </span>
                    <span>
                        <i className="lg r" /> Scheduled, not completed
                    </span>
                    <span>
                        <i className="lg n" /> Rest or no entry
                    </span>
                </div>
            </div>

            <div className="feedback-highlights">
                <div className="fb-head">
                    <h4>Recent session feedback</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {newFeedbackCount > 0 && (
                            <span className="new-badge">
                                {newFeedbackCount} new {newFeedbackCount === 1 ? 'note' : 'notes'}
                            </span>
                        )}
                        <button type="button" className="mark-seen" onClick={onMarkFeedbackSeen}>
                            Mark seen
                        </button>
                    </div>
                </div>
                {feedbackRows.length === 0 ? (
                    <p className="fb-empty">No completed workouts with feedback yet.</p>
                ) : (
                    feedbackRows.map((row) => (
                        <div key={row.dateStr} className="fb-row">
                            <div className="fb-date">{row.dateStr}</div>
                            {row.severity !== 'ok' && (
                                <div className={`fb-sev ${row.severity}`}>{sevLabel(row.severity)}</div>
                            )}
                            <div className="fb-summary">{row.summary}</div>
                        </div>
                    ))
                )}
            </div>

            <AssignmentControls selectedDate={selectedDate} onAssign={onAssign} />
            <ScheduleCalendar weekDays={weekDays} onDayClick={onDateSelect} />

            {selectedDate && selectedDayLog && (
                <SessionLogReadonly log={selectedDayLog} dateLabel={selectedDate} />
            )}
        </div>
    );
};
