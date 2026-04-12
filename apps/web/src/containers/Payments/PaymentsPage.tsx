import React, { useState } from 'react';
import { useTrainee } from '../../context/TraineeContext';
import type { PaymentMethodType, Trainee, TraineePayment } from '../../types';
import './PaymentsPage.scss';

const defaultPayment = (): TraineePayment => ({
    method: 'card',
    cardDisplay: '',
    nextPaymentDate: new Date().toISOString().split('T')[0],
    installmentsTotal: 12,
    installmentsRemaining: 12,
    commitmentMonthsRemaining: 12,
});

export const PaymentsPage: React.FC = () => {
    const { trainees, updateTrainee } = useTrainee();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<TraineePayment | null>(null);

    const openEdit = (t: Trainee) => {
        setEditingId(t.id);
        setDraft(t.payment ? { ...t.payment } : defaultPayment());
    };

    const save = () => {
        if (!editingId || !draft) return;
        updateTrainee(editingId, { payment: draft });
        setEditingId(null);
        setDraft(null);
    };

    const cancel = () => {
        setEditingId(null);
        setDraft(null);
    };

    return (
        <div className="payments-page">
            <header className="payments-header">
                <h1>Payments</h1>
                <p>Track payment method, schedule, and installment plan per trainee.</p>
            </header>

            <div className="payments-table-wrap">
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th>Trainee</th>
                            <th>Method</th>
                            <th>Card / note</th>
                            <th>Next payment</th>
                            <th>Installments</th>
                            <th>Months left</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainees.map((t) => {
                            const p = t.payment;
                            return (
                                <tr key={t.id}>
                                    <td>
                                        <strong>{t.name}</strong>
                                    </td>
                                    <td>{p?.method ?? '—'}</td>
                                    <td>{p?.cardDisplay || '—'}</td>
                                    <td>{p?.nextPaymentDate ?? '—'}</td>
                                    <td>
                                        {p != null
                                            ? `${p.installmentsRemaining} / ${p.installmentsTotal}`
                                            : '—'}
                                    </td>
                                    <td>{p?.commitmentMonthsRemaining ?? '—'}</td>
                                    <td>
                                        <button type="button" className="btn-edit" onClick={() => openEdit(t)}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editingId && draft && (
                <div className="payments-modal-overlay" role="dialog" aria-modal="true">
                    <div className="payments-modal">
                        <h2>Edit payment — {trainees.find((x) => x.id === editingId)?.name}</h2>
                        <div className="form-grid">
                            <label>
                                Method
                                <select
                                    value={draft.method}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            method: e.target.value as PaymentMethodType,
                                        })
                                    }
                                >
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank transfer</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </label>
                            <label>
                                Card display (e.g. Visa •••• 4242)
                                <input
                                    type="text"
                                    value={draft.cardDisplay ?? ''}
                                    onChange={(e) => setDraft({ ...draft, cardDisplay: e.target.value })}
                                    placeholder="Non-sensitive display only"
                                />
                            </label>
                            <label>
                                Next payment date
                                <input
                                    type="date"
                                    value={draft.nextPaymentDate}
                                    onChange={(e) => setDraft({ ...draft, nextPaymentDate: e.target.value })}
                                />
                            </label>
                            <label>
                                Total installments
                                <input
                                    type="number"
                                    min={1}
                                    value={draft.installmentsTotal}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            installmentsTotal: Math.max(1, parseInt(e.target.value, 10) || 1),
                                        })
                                    }
                                />
                            </label>
                            <label>
                                Remaining installments
                                <input
                                    type="number"
                                    min={0}
                                    value={draft.installmentsRemaining}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            installmentsRemaining: Math.max(
                                                0,
                                                parseInt(e.target.value, 10) || 0
                                            ),
                                        })
                                    }
                                />
                            </label>
                            <label>
                                Commitment months remaining
                                <input
                                    type="number"
                                    min={0}
                                    value={draft.commitmentMonthsRemaining}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            commitmentMonthsRemaining: Math.max(
                                                0,
                                                parseInt(e.target.value, 10) || 0
                                            ),
                                        })
                                    }
                                />
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={cancel}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary" onClick={save}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
