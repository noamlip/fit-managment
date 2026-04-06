import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './FeedbackModal.scss';
interface IFeedbackModalProps {
    isCompleted: boolean;
    questions: any[];
    initialAnswers: Record<string, any>;
    onSubmit: (answers: Record<string, any>) => void;
    onCancel: () => void;
    title?: string;
    submitText?: string;
}

export const FeedbackModal: React.FC<IFeedbackModalProps> = ({ isCompleted, questions, initialAnswers, onSubmit, onCancel, title, submitText }) => {
    const [answers, setAnswers] = useState(initialAnswers);

    const handleInputChange = (id: string, value: any) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const modalContent = (
        <div className="feedback-modal">
            <div className="modal-content">
                <h2>{title || (isCompleted ? "Edit Daily Feedback" : "Daily Feedback")}</h2>
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
                        {q.type === 'emoji_scale' && (
                            <>
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    value={answers[q.id] || 3}
                                    onChange={e => handleInputChange(q.id, e.target.value)}
                                    className="emoji-range"
                                />
                                <div className="scale-labels emoji-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginTop: '10px' }}>
                                    <span style={{ filter: String(answers[q.id] || 3) === '1' ? 'grayscale(0%)' : 'grayscale(100%)', opacity: String(answers[q.id] || 3) === '1' ? 1 : 0.5, transition: 'all 0.2s' }}>😴</span>
                                    <span style={{ filter: String(answers[q.id] || 3) === '2' ? 'grayscale(0%)' : 'grayscale(100%)', opacity: String(answers[q.id] || 3) === '2' ? 1 : 0.5, transition: 'all 0.2s' }}>🥱</span>
                                    <span style={{ filter: String(answers[q.id] || 3) === '3' ? 'grayscale(0%)' : 'grayscale(100%)', opacity: String(answers[q.id] || 3) === '3' ? 1 : 0.5, transition: 'all 0.2s' }}>😐</span>
                                    <span style={{ filter: String(answers[q.id] || 3) === '4' ? 'grayscale(0%)' : 'grayscale(100%)', opacity: String(answers[q.id] || 3) === '4' ? 1 : 0.5, transition: 'all 0.2s' }}>🙂</span>
                                    <span style={{ filter: String(answers[q.id] || 3) === '5' ? 'grayscale(0%)' : 'grayscale(100%)', opacity: String(answers[q.id] || 3) === '5' ? 1 : 0.5, transition: 'all 0.2s' }}>🤩</span>
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
                        {submitText || (isCompleted ? "Update Feedback" : "Complete Workout")}
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};
