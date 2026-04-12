import React, { useEffect, useState } from 'react';
import type { Trainee } from '../../types';
import {
    Calendar,
    Thermometer,
    Heart,
    Moon,
    AlertTriangle,
    Image as ImageIcon,
    Clock,
    TrendingUp,
    Utensils,
} from 'lucide-react';
import { useTrainee } from '../../context/TraineeContext';
import './WeeklyCheckinsTab.scss';

interface IProps {
    trainee: Trainee;
}

export const WeeklyCheckinsTab: React.FC<IProps> = ({ trainee }) => {
    const { updateTrainee } = useTrainee();
    const [selectedId, setSelectedId] = useState(0);
    const feedbackList = trainee.weeklyFeedback || [];

    useEffect(() => {
        if (feedbackList.length === 0) return;
        const rec = feedbackList[0];
        if (rec && rec.coachReviewed !== true) {
            updateTrainee(trainee.id, {
                weeklyFeedback: feedbackList.map((f, i) =>
                    i === 0 ? { ...f, coachReviewed: true } : f
                ),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mark default visible row once when modal opens for this trainee
    }, [trainee.id]);

    if (feedbackList.length === 0) {
        return (
            <div className="empty-state">
                <Calendar size={48} />
                <p>No weekly check-ins submitted by {trainee.name} yet.</p>
            </div>
        );
    }

    const safeIdx = selectedId >= 0 && selectedId < feedbackList.length ? selectedId : 0;
    const selectedFeedback = feedbackList[safeIdx];

    const handleSelectCheckin = (idx: number) => {
        setSelectedId(idx);
        const list = trainee.weeklyFeedback || [];
        const rec = list[idx];
        if (!rec || rec.coachReviewed === true) return;
        updateTrainee(trainee.id, {
            weeklyFeedback: list.map((f, i) => (i === idx ? { ...f, coachReviewed: true } : f)),
        });
    };

    const digestionLabel =
        selectedFeedback.digestion === 'good'
            ? 'Good'
            : selectedFeedback.digestion === 'poor'
              ? 'Poor'
              : selectedFeedback.digestion === 'ok'
                ? 'OK'
                : '—';

    const structuredPhotoSlots: { key: string; label: string; url?: string }[] = [
        { key: 'front', label: 'Front', url: selectedFeedback.photoFrontUrl },
        { key: 'bar', label: 'Bar', url: selectedFeedback.photoBarUrl },
        { key: 'side', label: 'Side', url: selectedFeedback.photoSideUrl },
    ];

    return (
        <div className="weekly-checkins-tab">
            <div className="checkins-sidebar">
                {feedbackList.map((record, idx) => (
                    <button
                        key={`${record.date}-${idx}`}
                        type="button"
                        className={`checkin-item ${safeIdx === idx ? 'active' : ''} ${record.coachReviewed !== true ? 'needs-review' : ''}`}
                        onClick={() => handleSelectCheckin(idx)}
                    >
                        <Calendar size={16} />
                        <span>{record.date}</span>
                        {record.coachReviewed !== true && (
                            <span className="needs-review-chip">Needs review</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="checkin-details">
                {selectedFeedback ? (
                    <div className="details-content">
                        <div className="details-header">
                            <h3>Check-in for {selectedFeedback.date}</h3>
                        </div>

                        <div className="checkin-summary-card">
                            <h4>Summary</h4>
                            <div className="summary-grid">
                                <div>
                                    <label>Sleep quality</label>
                                    <span>
                                        {selectedFeedback.sleepQuality1to10 != null
                                            ? `${selectedFeedback.sleepQuality1to10}/10`
                                            : '—'}
                                    </span>
                                </div>
                                <div>
                                    <label>Avg sleep</label>
                                    <span>{selectedFeedback.sleepAverage} hrs/night</span>
                                </div>
                                <div>
                                    <label>Hunger</label>
                                    <span>{selectedFeedback.hungerLevel}/10</span>
                                </div>
                                <div>
                                    <label>Satiety</label>
                                    <span>
                                        {selectedFeedback.satietyLevel1to10 != null
                                            ? `${selectedFeedback.satietyLevel1to10}/10`
                                            : '—'}
                                    </span>
                                </div>
                                <div>
                                    <label>Digestion</label>
                                    <span>{digestionLabel}</span>
                                </div>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            <div className="metric-card">
                                <Thermometer className="icon-metabolism" />
                                <div className="info">
                                    <label>Metabolism</label>
                                    <div className="score">
                                        <div className="progress-bar">
                                            <div
                                                className="fill"
                                                style={{ width: `${selectedFeedback.metabolism * 10}%` }}
                                            />
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
                                            <div
                                                className="fill"
                                                style={{
                                                    width: `${selectedFeedback.generalFeeling * 10}%`,
                                                    background: '#ff4d4d',
                                                }}
                                            />
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
                                            <div
                                                className="fill"
                                                style={{
                                                    width: `${selectedFeedback.hungerLevel * 10}%`,
                                                    background: '#fb7185',
                                                }}
                                            />
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
                                        {selectedFeedback.workoutProgression === 'decreased' &&
                                            '📉 Decreased Performance'}
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
                                <h4>
                                    <AlertTriangle size={16} /> Injury Description
                                </h4>
                                <div className="text-box">{selectedFeedback.injuryDetails}</div>
                            </div>
                        )}

                        {(structuredPhotoSlots.some((s) => s.url) ||
                            (selectedFeedback.photos && selectedFeedback.photos.length > 0)) && (
                            <div className="detail-section">
                                <h4>
                                    <ImageIcon size={16} /> Progress Photos
                                </h4>
                                {structuredPhotoSlots.some((s) => s.url) && (
                                    <div className="structured-photo-row">
                                        {structuredPhotoSlots.map(
                                            (slot) =>
                                                slot.url && (
                                                    <div key={slot.key} className="structured-photo-item">
                                                        <span className="photo-label">{slot.label}</span>
                                                        <div className="gallery-item">
                                                            <img src={slot.url} alt={`${slot.label} ${selectedFeedback.date}`} />
                                                        </div>
                                                    </div>
                                                )
                                        )}
                                    </div>
                                )}
                                {selectedFeedback.photos && selectedFeedback.photos.length > 0 && (
                                    <div className="photo-gallery">
                                        {selectedFeedback.photos.map((url, i) => (
                                            <div key={i} className="gallery-item">
                                                <img src={url} alt={`Week ${selectedFeedback.date} - ${i}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
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
