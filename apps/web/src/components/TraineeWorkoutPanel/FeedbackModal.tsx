import { useState, useEffect } from 'react';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import type { FeedbackAnswers, FeedbackQuestion } from '../../types';
import './FeedbackModal.scss';

interface Props {
    isCompleted: boolean;
    questions: FeedbackQuestion[];
    initialAnswers: FeedbackAnswers;
    onSubmit: (answers: FeedbackAnswers) => void;
    onCancel: () => void;
}

export const FeedbackModal: React.FC<Props> = ({
    isCompleted,
    questions,
    initialAnswers,
    onSubmit,
    onCancel,
}) => {
    useEscapeToClose(onCancel, true);
    const [answers, setAnswers] = useState<FeedbackAnswers>({ ...initialAnswers });

    useEffect(() => {
        setAnswers({ ...initialAnswers });
    }, [initialAnswers]);

    const setVal = (id: string, v: string | number) => {
        setAnswers((a) => ({ ...a, [id]: v }));
    };

    return (
        <div className="feedback-modal-overlay">
            <div className="feedback-modal">
                <h2>{isCompleted ? 'Update feedback' : 'Workout feedback'}</h2>
                {questions.map((q) => (
                    <div key={q.id}>
                        <label htmlFor={q.id}>
                            {q.text}
                            {q.required ? ' *' : ''}
                        </label>
                        {q.type === 'text' && (
                            <textarea
                                id={q.id}
                                rows={3}
                                value={String(answers[q.id] ?? '')}
                                onChange={(e) => setVal(q.id, e.target.value)}
                                placeholder={(q.config as { placeholder?: string })?.placeholder}
                            />
                        )}
                        {(q.type === 'scale' || q.type === 'emoji_scale') && (
                            <input
                                id={q.id}
                                type="range"
                                min={q.config?.min ?? 1}
                                max={q.config?.max ?? 10}
                                value={Number(answers[q.id] ?? q.config?.min ?? 1)}
                                onChange={(e) => setVal(q.id, Number(e.target.value))}
                            />
                        )}
                        {q.type === 'number' && (
                            <input
                                id={q.id}
                                type="number"
                                value={String(answers[q.id] ?? '')}
                                onChange={(e) => setVal(q.id, Number(e.target.value))}
                            />
                        )}
                    </div>
                ))}
                <div className="fb-actions">
                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="submit" onClick={() => onSubmit(answers)}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};
