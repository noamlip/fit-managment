import React, { useState } from 'react';

interface IFeedbackModalProps {
    isCompleted: boolean;
    questions: any[];
    initialAnswers: Record<string, any>;
    onSubmit: (answers: Record<string, any>) => void;
    onCancel: () => void;
}

export const FeedbackModal: React.FC<IFeedbackModalProps> = ({ isCompleted, questions, initialAnswers, onSubmit, onCancel }) => {
    const [answers, setAnswers] = useState(initialAnswers);

    const handleInputChange = (id: string, value: any) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="feedback-modal">
            <div className="modal-content">
                <h2>{isCompleted ? "Edit Feedback" : "Workout Feedback"}</h2>
                {questions.map(q => (
                    <div key={q.id} className="question-group">
                        <label>
                            {q.text} {q.required && <span className="required-asterisk">*</span>}
                        </label>
                        {q.type === 'text' && (
                            <textarea
                                rows={3}
                                placeholder={q.config?.placeholder}
                                value={answers[q.id] || ''}
                                onChange={e => handleInputChange(q.id, e.target.value)}
                            />
                        )}
                        {q.type === 'number' && (
                            <input
                                type="number"
                                placeholder={q.config?.placeholder}
                                value={answers[q.id] || ''}
                                onChange={e => handleInputChange(q.id, e.target.value)}
                            />
                        )}
                        {q.type === 'scale' && (
                            <>
                                <input
                                    type="range"
                                    min={q.config?.min || 1}
                                    max={q.config?.max || 10}
                                    value={answers[q.id] || q.config?.min || 1}
                                    onChange={e => handleInputChange(q.id, e.target.value)}
                                />
                                <div className="scale-labels">
                                    <span>{q.config?.labels?.[q.config.min] || q.config?.min || 1}</span>
                                    <span>{q.config?.labels?.[q.config.max] || q.config?.max || 10}</span>
                                </div>
                            </>
                        )}
                        {q.type === 'image' && (
                            <div className="file-upload">
                                <p>{answers[q.id] ? "Image Uploaded" : "Click to upload image"}</p>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={e => handleInputChange(q.id, e.target.files?.[0])}
                                />
                            </div>
                        )}
                    </div>
                ))}
                <div className="actions">
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="submit-btn" onClick={() => onSubmit(answers)}>
                        {isCompleted ? "Update Feedback" : "Complete Workout"}
                    </button>
                </div>
            </div>
        </div>
    );
};
