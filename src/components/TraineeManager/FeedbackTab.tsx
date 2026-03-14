import React, { useEffect, useState } from 'react';
import type { Trainee } from '../../types';
import { MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface IFeedbackTabProps {
    trainee: Trainee;
}

interface IFeedbackQuestion {
    id: string;
    text: string;
    type: string;
    [key: string]: any;
}

export const FeedbackTab: React.FC<IFeedbackTabProps> = ({ trainee }) => {
    const [questions, setQuestions] = useState<IFeedbackQuestion[]>([]);
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch('/data/workout_feedback.json')
            .then(res => res.json())
            .then(data => setQuestions(data.questions))
            .catch(err => console.error("Failed to load feedback questions", err));
    }, []);

    // Get all completed workouts with feedback, sorted by date (newest first)
    const feedbackData = Object.entries(trainee.schedule || {})
        .filter(([_, session]) => session.status === 'completed' && session.feedback)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

    const toggleExpand = (date: string) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    if (feedbackData.length === 0) {
        return (
            <div className="empty-feedback">
                <MessageSquare size={48} color="#444" />
                <p>No feedback submitted yet.</p>
            </div>
        );
    }

    return (
        <div className="feedback-tab">
            <div className="feedback-timeline">
                {feedbackData.map(([date, session]) => {
                    const isExpanded = expandedDates[date];
                    const answers = session.feedback || {};
                    const workoutType = session.workoutType.charAt(0).toUpperCase() + session.workoutType.slice(1);

                    return (
                        <div key={date} className={`feedback-card ${isExpanded ? 'expanded' : ''}`}>
                            <div className="card-header" onClick={() => toggleExpand(date)}>
                                <div className="header-left">
                                    <Calendar size={18} color="#aaa" />
                                    <span className="date">{date}</span>
                                    <span className={`workout-tag ${session.workoutType}`}>{workoutType}</span>
                                </div>
                                <button className="expand-btn">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="card-content">
                                    {questions.map(q => {
                                        const answer = answers[q.id];
                                        if (answer === undefined || answer === null || answer === '') return null;

                                        return (
                                            <div key={q.id} className="qa-pair">
                                                <div className="question">{q.text}</div>
                                                <div className="answer">
                                                    {q.type === 'scale' && (
                                                        <span className="scale-display">
                                                            Rating: <strong>{answer}</strong>/10
                                                        </span>
                                                    )}
                                                    {q.type === 'image' && (
                                                        <span className="image-placeholder">
                                                            [Image Uploaded]
                                                        </span>
                                                    )}
                                                    {(q.type === 'text' || q.type === 'number') && (
                                                        <span>{answer}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
