import { useCallback, useEffect, useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { useToast } from '../../context/ToastContext';
import { saveExerciseCatalog } from '../../services/exercisesCatalogApi';
import type { ExerciseCatalog } from '../../types';
import './ExerciseLibraryPage.scss';

function cloneCatalog(c: ExerciseCatalog): ExerciseCatalog {
    const out: ExerciseCatalog = {};
    for (const [k, v] of Object.entries(c)) {
        out[k] = [...v];
    }
    return out;
}

function buildCleanCatalog(d: ExerciseCatalog): { ok: true; catalog: ExerciseCatalog } | { ok: false; message: string } {
    const merged = new Map<string, string[]>();
    for (const [rawPart, names] of Object.entries(d)) {
        const part = rawPart.trim();
        if (!part) continue;
        const existing = merged.get(part) ?? [];
        merged.set(part, [...existing, ...names]);
    }
    const next: ExerciseCatalog = {};
    for (const [part, allNames] of merged) {
        const seen = new Set<string>();
        const list: string[] = [];
        for (const n of allNames) {
            const t = n.trim();
            if (!t) continue;
            const k = t.toLowerCase();
            if (seen.has(k)) continue;
            seen.add(k);
            list.push(t);
        }
        if (list.length === 0) {
            return { ok: false, message: `Body part "${part}" must have at least one exercise name.` };
        }
        next[part] = list;
    }
    if (Object.keys(next).length === 0) {
        return { ok: false, message: 'Add at least one body part with exercises.' };
    }
    return { ok: true, catalog: next };
}

export function ExerciseLibraryPage() {
    const { exerciseCatalog, reloadCatalog } = useWorkout();
    const { addToast } = useToast();
    const [draft, setDraft] = useState<ExerciseCatalog>({});
    const [newPartName, setNewPartName] = useState('');
    const [newExerciseByPart, setNewExerciseByPart] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDraft(cloneCatalog(exerciseCatalog));
    }, [exerciseCatalog]);

    const renamePart = useCallback(
        (from: string) => {
            const next = window.prompt('Body part name', from);
            if (next == null) return;
            const trimmed = next.trim();
            if (!trimmed || trimmed === from) return;
            setDraft((prev) => {
                const { [from]: exercises, ...rest } = prev;
                if (!exercises) return prev;
                if (rest[trimmed] !== undefined) {
                    addToast('A body part with that name already exists.', 'error');
                    return prev;
                }
                return { ...rest, [trimmed]: exercises };
            });
        },
        [addToast]
    );

    const removePart = useCallback((part: string) => {
        if (!confirm(`Remove body part "${part}" and all its exercises?`)) return;
        setDraft((prev) => {
            const rest = { ...prev };
            delete rest[part];
            return rest;
        });
    }, []);

    const addPart = useCallback(() => {
        const p = newPartName.trim();
        if (!p) {
            addToast('Enter a body part name.', 'error');
            return;
        }
        setDraft((prev) => {
            if (prev[p] !== undefined) {
                addToast('That body part already exists.', 'error');
                return prev;
            }
            return { ...prev, [p]: [] };
        });
        setNewPartName('');
    }, [newPartName, addToast]);

    const addExercise = useCallback(
        (part: string) => {
            const raw = (newExerciseByPart[part] ?? '').trim();
            if (!raw) {
                addToast('Enter an exercise name.', 'error');
                return;
            }
            setDraft((prev) => {
                const list = prev[part] ?? [];
                const lower = raw.toLowerCase();
                if (list.some((n) => n.trim().toLowerCase() === lower)) {
                    addToast('That exercise is already listed under this part.', 'error');
                    return prev;
                }
                return { ...prev, [part]: [...list, raw] };
            });
            setNewExerciseByPart((m) => ({ ...m, [part]: '' }));
        },
        [newExerciseByPart, addToast]
    );

    const renameExercise = useCallback((part: string, index: number, name: string) => {
        setDraft((prev) => {
            const list = [...(prev[part] ?? [])];
            if (!list[index]) return prev;
            list[index] = name;
            return { ...prev, [part]: list };
        });
    }, []);

    const removeExercise = useCallback((part: string, index: number) => {
        setDraft((prev) => {
            const list = [...(prev[part] ?? [])];
            list.splice(index, 1);
            return { ...prev, [part]: list };
        });
    }, []);

    const handleSave = async () => {
        const built = buildCleanCatalog(draft);
        if (!built.ok) {
            addToast(built.message, 'error');
            return;
        }
        setSaving(true);
        try {
            await saveExerciseCatalog(built.catalog);
            await reloadCatalog();
            addToast('Exercise library saved.', 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : 'Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const parts = Object.keys(draft);

    return (
        <div className="exercise-library-page">
            <p className="exercise-library-lead">
                Edit the global exercise catalog. Changes apply to workout builders and default templates after save.
            </p>

            <div className="exercise-library-add-part">
                <label htmlFor="ex-lib-new-part" className="exercise-library-label">
                    New body part
                </label>
                <div className="exercise-library-add-row">
                    <input
                        id="ex-lib-new-part"
                        type="text"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        placeholder="e.g. Chest"
                    />
                    <button type="button" onClick={addPart}>
                        Add part
                    </button>
                </div>
            </div>

            <div className="exercise-library-parts">
                {parts.length === 0 ? (
                    <p className="exercise-library-empty">No body parts yet. Add one above.</p>
                ) : (
                    parts.map((part) => (
                        <section key={part} className="exercise-library-part">
                            <header className="exercise-library-part-head">
                                <div className="exercise-library-part-title-block">
                                    <span className="exercise-library-label">Body part</span>
                                    <div className="exercise-library-part-title-row">
                                        <h3 className="exercise-library-part-title">{part}</h3>
                                        <button type="button" className="exercise-library-rename-part" onClick={() => renamePart(part)}>
                                            Rename
                                        </button>
                                    </div>
                                </div>
                                <button type="button" className="exercise-library-remove-part" onClick={() => removePart(part)}>
                                    Remove part
                                </button>
                            </header>
                            <ul className="exercise-library-list">
                                {(draft[part] ?? []).map((name, i) => (
                                    <li key={`${part}-${i}-${name}`}>
                                        <input
                                            type="text"
                                            aria-label={`Exercise ${i + 1} under ${part}`}
                                            value={name}
                                            onChange={(e) => renameExercise(part, i, e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeExercise(part, i)}>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="exercise-library-add-ex">
                                <input
                                    type="text"
                                    aria-label={`New exercise under ${part}`}
                                    value={newExerciseByPart[part] ?? ''}
                                    placeholder="Exercise name"
                                    onChange={(e) =>
                                        setNewExerciseByPart((m) => ({
                                            ...m,
                                            [part]: e.target.value,
                                        }))
                                    }
                                />
                                <button type="button" onClick={() => addExercise(part)}>
                                    Add exercise
                                </button>
                            </div>
                        </section>
                    ))
                )}
            </div>

            <div className="exercise-library-actions">
                <button type="button" className="exercise-library-save" disabled={saving} onClick={() => void handleSave()}>
                    {saving ? 'Saving…' : 'Save library'}
                </button>
            </div>
        </div>
    );
}
