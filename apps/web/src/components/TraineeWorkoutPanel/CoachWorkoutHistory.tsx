import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Trainee, FeedbackAnswerValue } from '../../types';
import './CoachWorkoutHistory.scss';

const MAX_HISTORY_RANGE_DAYS = 31;

type HistoryRangePreset = 'last7' | 'prev7' | 'custom';

interface CoachWorkoutHistoryProps {
    trainee: Trainee;
    selectedDetailDate: string | null;
    onSelectDetailDate: (date: string | null) => void;
}

function scheduleEntryHasFeedback(feedback?: Record<string, FeedbackAnswerValue>): boolean {
    if (!feedback) return false;
    return Object.values(feedback).some((v) => {
        if (v instanceof File) return true;
        if (typeof v === 'string') return v.trim().length > 0;
        return typeof v === 'number' || typeof v === 'boolean';
    });
}

function startOfLocalDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function toScheduleDateString(d: Date): string {
    return d.toISOString().split('T')[0];
}

function parseIsoDateLocal(iso: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const day = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(day)) return null;
    return new Date(y, mo, day);
}

function enumerateInclusiveDates(startIso: string, endIso: string): string[] {
    const start = parseIsoDateLocal(startIso);
    const end = parseIsoDateLocal(endIso);
    if (!start || !end || start > end) return [];
    const out: string[] = [];
    const cur = startOfLocalDay(start);
    const endDay = startOfLocalDay(end);
    while (cur <= endDay) {
        out.push(toScheduleDateString(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return out;
}

function daysInclusive(startIso: string, endIso: string): number {
    const start = parseIsoDateLocal(startIso);
    const end = parseIsoDateLocal(endIso);
    if (!start || !end || start > end) return 0;
    return Math.round((startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) / 86400000) + 1;
}

function labelWorkoutType(wt: string | undefined): string {
    if (!wt) return '—';
    if (wt === 'rest') return 'Rest';
    return wt.charAt(0).toUpperCase() + wt.slice(1);
}

export function CoachWorkoutHistory({
    trainee,
    selectedDetailDate,
    onSelectDetailDate,
}: CoachWorkoutHistoryProps) {
    const [historyPreset, setHistoryPreset] = useState<HistoryRangePreset>('last7');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const defaultLast7Bounds = useCallback(() => {
        const today = startOfLocalDay(new Date());
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return { start: toScheduleDateString(start), end: toScheduleDateString(today) };
    }, []);

    useEffect(() => {
        if (historyPreset !== 'custom') return;
        if (customStart && customEnd) return;
        const b = defaultLast7Bounds();
        setCustomStart((s) => s || b.start);
        setCustomEnd((e) => e || b.end);
    }, [historyPreset, customStart, customEnd, defaultLast7Bounds]);

    const { historyBounds, rangeError } = useMemo(() => {
        const today = startOfLocalDay(new Date());
        if (historyPreset === 'last7') {
            const start = new Date(today);
            start.setDate(start.getDate() - 6);
            return {
                historyBounds: { start: toScheduleDateString(start), end: toScheduleDateString(today) },
                rangeError: null as string | null,
            };
        }
        if (historyPreset === 'prev7') {
            const end = new Date(today);
            end.setDate(end.getDate() - 1);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            return {
                historyBounds: { start: toScheduleDateString(start), end: toScheduleDateString(end) },
                rangeError: null as string | null,
            };
        }
        const s = customStart.trim();
        const e = customEnd.trim();
        if (!s || !e) {
            return { historyBounds: null, rangeError: 'Choose a start and end date.' };
        }
        if (s > e) {
            return { historyBounds: null, rangeError: 'Start date must be on or before end date.' };
        }
        const n = daysInclusive(s, e);
        if (n > MAX_HISTORY_RANGE_DAYS) {
            return {
                historyBounds: null,
                rangeError: `Range cannot exceed ${MAX_HISTORY_RANGE_DAYS} days.`,
            };
        }
        if (n === 0) {
            return { historyBounds: null, rangeError: 'Invalid range.' };
        }
        return { historyBounds: { start: s, end: e }, rangeError: null };
    }, [historyPreset, customStart, customEnd]);

    const historyDates = useMemo(() => {
        if (!historyBounds) return [];
        return enumerateInclusiveDates(historyBounds.start, historyBounds.end);
    }, [historyBounds]);

    const historyRows = useMemo(() => {
        return historyDates.map((dateStr) => {
            const day = trainee.schedule?.[dateStr];
            const hasEntry = !!day;
            const planned = labelWorkoutType(day?.workoutType);
            let statusLabel: string;
            let statusClass: string;
            if (!hasEntry) {
                statusLabel = 'No entry';
                statusClass = 'wh-status-none';
            } else if (day!.workoutType === 'rest') {
                statusLabel = day!.status === 'completed' ? 'Completed' : 'Pending';
                statusClass = day!.status === 'completed' ? 'wh-status-done' : 'wh-status-pending';
            } else if (day!.status === 'completed') {
                statusLabel = 'Completed';
                statusClass = 'wh-status-done';
            } else if (day!.status === 'skipped') {
                statusLabel = 'Skipped';
                statusClass = 'wh-status-skip';
            } else {
                statusLabel = 'Pending';
                statusClass = 'wh-status-pending';
            }
            const hasSession = Boolean(day?.sessionLog?.endedAt);
            const hasFb = scheduleEntryHasFeedback(day?.feedback);
            return {
                dateStr,
                weekday: parseIsoDateLocal(dateStr)?.toLocaleDateString('en-US', { weekday: 'short' }) ?? '',
                planned,
                statusLabel,
                statusClass,
                hasSession,
                hasFb,
                rowTone: !hasEntry
                    ? 'neutral'
                    : day!.workoutType === 'rest'
                      ? 'neutral'
                      : day!.status === 'completed'
                        ? 'done'
                        : 'missed',
            };
        });
    }, [historyDates, trainee.schedule]);

    const selectedDay = selectedDetailDate ? trainee.schedule?.[selectedDetailDate] : null;
    const sessionLog = selectedDay?.sessionLog;

    const switchToCustomWithDefaults = () => {
        const b = defaultLast7Bounds();
        setCustomStart(b.start);
        setCustomEnd(b.end);
        setHistoryPreset('custom');
    };

    return (
        <div className="coach-workout-history">
            <h4 className="workout-history-title">Workout history</h4>
            <p className="workout-history-lead">
                Pick a date range to see what was planned, completed, and whether session logs or feedback exist.
                Select a row to inspect the session log below.
            </p>

            <div className="workout-history-toolbar">
                <div className="wh-presets" role="group" aria-label="Date range preset">
                    <button
                        type="button"
                        className={historyPreset === 'last7' ? 'active' : ''}
                        onClick={() => setHistoryPreset('last7')}
                    >
                        Last 7 days
                    </button>
                    <button
                        type="button"
                        className={historyPreset === 'prev7' ? 'active' : ''}
                        onClick={() => setHistoryPreset('prev7')}
                    >
                        Previous 7 days
                    </button>
                    <button
                        type="button"
                        className={historyPreset === 'custom' ? 'active' : ''}
                        onClick={switchToCustomWithDefaults}
                    >
                        Custom range
                    </button>
                </div>

                {historyPreset === 'custom' && (
                    <div className="wh-custom-dates">
                        <label className="wh-date-field">
                            <span>From</span>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                        </label>
                        <label className="wh-date-field">
                            <span>To</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </label>
                    </div>
                )}
            </div>

            {rangeError && <p className="workout-history-error">{rangeError}</p>}

            {historyBounds && (
                <>
                    <p className="workout-history-range-label">
                        Showing <strong>{historyBounds.start}</strong> → <strong>{historyBounds.end}</strong> (
                        {historyDates.length} {historyDates.length === 1 ? 'day' : 'days'})
                    </p>

                    <div className="workout-history-table-scroll">
                        <table className="workout-history-table">
                            <thead>
                                <tr>
                                    <th scope="col">Date</th>
                                    <th scope="col">Planned</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Session log</th>
                                    <th scope="col">Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyRows.map((row) => (
                                    <tr
                                        key={row.dateStr}
                                        className={`wh-row wh-row--${row.rowTone} ${
                                            row.dateStr === selectedDetailDate ? 'wh-row--selected' : ''
                                        }`}
                                    >
                                        <td>
                                            <button
                                                type="button"
                                                className="wh-row-select"
                                                onClick={() => onSelectDetailDate(row.dateStr)}
                                            >
                                                <span className="wh-dow">{row.weekday}</span>
                                                <span className="wh-iso">{row.dateStr}</span>
                                            </button>
                                        </td>
                                        <td>{row.planned}</td>
                                        <td>
                                            <span className={`wh-badge ${row.statusClass}`}>{row.statusLabel}</span>
                                        </td>
                                        <td>{row.hasSession ? 'Yes' : '—'}</td>
                                        <td>{row.hasFb ? 'Yes' : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="workout-history-legend">
                        <span>
                            <i className="wh-lg wh-lg--done" /> Completed workout
                        </span>
                        <span>
                            <i className="wh-lg wh-lg--missed" /> Scheduled, not completed
                        </span>
                        <span>
                            <i className="wh-lg wh-lg--neutral" /> Rest / no entry
                        </span>
                    </div>
                </>
            )}

            {selectedDetailDate && sessionLog?.endedAt && (
                <div className="session-log-coach">
                    <h4>Session log — {selectedDetailDate}</h4>
                    <p className="session-meta">
                        Duration{' '}
                        {sessionLog.totalElapsedSeconds != null
                            ? `${Math.floor(sessionLog.totalElapsedSeconds / 60)}m ${sessionLog.totalElapsedSeconds % 60}s`
                            : '—'}
                        {sessionLog.restExtensions && sessionLog.restExtensions.length > 0 && (
                            <>
                                {' · '}
                                Extra rest:{' '}
                                {sessionLog.restExtensions.reduce((a, e) => a + e.addedSeconds, 0)}s total
                            </>
                        )}
                    </p>
                    <ul className="session-ex-list">
                        {sessionLog.exercises.map((ex) => (
                            <li key={ex.exerciseId}>
                                <strong>{ex.name}</strong>
                                <ul>
                                    {ex.sets.map((s) => (
                                        <li key={s.setIndex}>
                                            Set {s.setIndex}
                                            {s.weightKg != null ? ` · ${s.weightKg} kg` : ''}
                                            {s.repsCompleted ? ` · ${s.repsCompleted} reps` : ''}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    {sessionLog.restExtensions && sessionLog.restExtensions.length > 0 && (
                        <div className="session-rest-ext">
                            <span className="sub">Rest extensions</span>
                            <ul>
                                {sessionLog.restExtensions.map((r, i) => (
                                    <li key={i}>
                                        +{r.addedSeconds}s at {r.atElapsedSeconds}s elapsed
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
