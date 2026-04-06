import React, { useState } from 'react';
import type { Trainee } from '../../types';
import { Calendar, Thermometer, Heart, Moon, AlertTriangle, Image as ImageIcon, Clock, TrendingUp, Utensils } from 'lucide-react';
import './WeeklyCheckinsTab.scss';

interface IProps {
    trainee: Trainee;
}

export const WeeklyCheckinsTab: React.FC<IProps> = ({ trainee }) => {
    const [selectedId, setSelectedId] = useState<number | null>(0);
    const feedbackList = trainee.weeklyFeedback || [];

    if (feedbackList.length === 0) {
        return (
            <div className="empty-state">
                <Calendar size={48} />
                <p>No weekly check-ins submitted by {trainee.name} yet.</p>
            </div>
        );
    }

    const selectedFeedback = selectedId !== null ? feedbackList[selectedId] : null;

    return (
        <div className="weekly-checkins-tab">
            <div className="checkins-sidebar">
                {feedbackList.map((record, idx) => (
                    <button 
                        key={idx} 
                        className={`checkin-item ${selectedId === idx ? 'active' : ''}`}
                        onClick={() => setSelectedId(idx)}
                    >
                        <Calendar size={16} />
                        <span>{record.date}</span>
                    </button>
                ))}
            </div>

            <div className="checkin-details">
                {selectedFeedback ? (
                    <div className="details-content">
                        <div className="details-header">
                            <h3>Check-in for {selectedFeedback.date}</h3>
                        </div>

                        <div className="metrics-grid">
                            <div className="metric-card">
                                <Thermometer className="icon-metabolism" />
                                <div className="info">
                                    <label>Metabolism</label>
                                    <div className="score">
                                        <div className="progress-bar">
                                            <div className="fill" style={{ width: `${selectedFeedback.metabolism * 10}%` }}></div>
                                        </div>
                                        <span>{selectedFeedback.metabolism}/10</span>
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <Heart className="icon-feeling" />
                                <div className="info">
                                    <label>General Feeling</label>
                                    <div className="score">
                                        <div className="progress-bar">
                                            <div className="fill" style={{ width: `${selectedFeedback.generalFeeling * 10}%`, background: '#ff4d4d' }}></div>
                                        </div>
                                        <span>{selectedFeedback.generalFeeling}/10</span>
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <Moon className="icon-sleep" />
                                <div className="info">
                                    <label>Avg Sleep</label>
                                    <div className="value">{selectedFeedback.sleepAverage} hrs/night</div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <Utensils className="icon-hunger" />
                                <div className="info">
                                    <label>Hunger Level</label>
                                    <div className="score">
                                        <div className="progress-bar">
                                            <div className="fill" style={{ width: `${selectedFeedback.hungerLevel * 10}%`, background: '#fb7185' }}></div>
                                        </div>
                                        <span>{selectedFeedback.hungerLevel}/10</span>
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card">
                                <Clock className="icon-time" />
                                <div className="info">
                                    <label>Avg Workout</label>
                                    <div className="value">{selectedFeedback.workoutDuration} min</div>
                                </div>
                            </div>

                            <div className={`metric-card progression-status ${selectedFeedback.workoutProgression}`}>
                                <TrendingUp className="icon-progression" />
                                <div className="info">
                                    <label>Workouts Feel</label>
                                    <div className="value">
                                        {selectedFeedback.workoutProgression === 'progressing' && '💪 Progressing'}
                                        {selectedFeedback.workoutProgression === 'stuck' && '⚠️ Feeling Stuck'}
                                        {selectedFeedback.workoutProgression === 'decreased' && '📉 Decreased Performance'}
                                    </div>
                                </div>
                            </div>

                            <div className={`metric-card injury-status ${selectedFeedback.injured ? 'has-injury' : ''}`}>
                                <AlertTriangle className="icon-injury" />
                                <div className="info">
                                    <label>Injury Status</label>
                                    <div className="value">{selectedFeedback.injured ? 'INJURED' : 'Healthy'}</div>
                                </div>
                            </div>
                        </div>

                        {selectedFeedback.injured && selectedFeedback.injuryDetails && (
                            <div className="detail-section">
                                <h4><AlertTriangle size={16} /> Injury Description</h4>
                                <div className="text-box">
                                    {selectedFeedback.injuryDetails}
                                </div>
                            </div>
                        )}

                        {selectedFeedback.photos && selectedFeedback.photos.length > 0 && (
                            <div className="detail-section">
                                <h4><ImageIcon size={16} /> Progress Photos</h4>
                                <div className="photo-gallery">
                                    {selectedFeedback.photos.map((url, i) => (
                                        <div key={i} className="gallery-item">
                                            <img src={url} alt={`Week ${selectedFeedback.date} - ${i}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="select-prompt">
                        <p>Select a check-in from the list to view details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
