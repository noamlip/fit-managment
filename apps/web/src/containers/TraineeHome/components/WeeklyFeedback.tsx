import React, { useState } from 'react';
import { ClipboardList, Trash2, Camera, Info } from 'lucide-react';
import type { DigestionStatus, Trainee, WeeklyFeedbackRecord } from '../../../types';
import { useTrainee } from '../../../context/TraineeContext';
import './WeeklyFeedback.scss';

interface IProps {
    trainee: Trainee | undefined;
}

export const WeeklyFeedback: React.FC<IProps> = ({ trainee }) => {
    const { updateTrainee } = useTrainee();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const [metabolism, setMetabolism] = useState(5);
    const [hungerLevel, setHungerLevel] = useState(5);
    const [generalFeeling, setGeneralFeeling] = useState(5);
    const [injured, setInjured] = useState(false);
    const [injuryDetails, setInjuryDetails] = useState('');
    const [sleepAverage, setSleepAverage] = useState(7);
    const [workoutDuration, setWorkoutDuration] = useState(60);
    const [workoutProgression, setWorkoutProgression] = useState<'progressing' | 'stuck' | 'decreased'>('progressing');
    const [photos, setPhotos] = useState<string[]>([]);
    const [sleepQuality1to10, setSleepQuality1to10] = useState(7);
    const [satietyLevel1to10, setSatietyLevel1to10] = useState(5);
    const [digestion, setDigestion] = useState<DigestionStatus>('ok');
    const [photoFrontUrl, setPhotoFrontUrl] = useState<string | undefined>();
    const [photoBarUrl, setPhotoBarUrl] = useState<string | undefined>();
    const [photoSideUrl, setPhotoSideUrl] = useState<string | undefined>();
    
    if (!trainee) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newRecord: WeeklyFeedbackRecord = {
            date: new Date().toISOString().split('T')[0],
            metabolism,
            hungerLevel,
            injured,
            injuryDetails: injured ? injuryDetails : '',
            generalFeeling,
            sleepAverage,
            sleepQuality1to10,
            satietyLevel1to10,
            digestion,
            workoutDuration,
            workoutProgression,
            photos,
            photoFrontUrl,
            photoBarUrl,
            photoSideUrl,
            coachReviewed: false,
        };

        const currentFeedback = trainee.weeklyFeedback || [];
        updateTrainee(trainee.id, {
            ...trainee,
            weeklyFeedback: [newRecord, ...currentFeedback]
        });

        // Reset and close
        setIsExpanded(false);
        setMetabolism(5);
        setHungerLevel(5);
        setGeneralFeeling(5);
        setInjured(false);
        setInjuryDetails('');
        setSleepAverage(7);
        setWorkoutDuration(60);
        setWorkoutProgression('progressing');
        setPhotos([]);
        setSleepQuality1to10(7);
        setSatietyLevel1to10(5);
        setDigestion('ok');
        setPhotoFrontUrl(undefined);
        setPhotoBarUrl(undefined);
        setPhotoSideUrl(undefined);
    };

    const handlePhotoAdd = () => {
        const dummyPhoto = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop';
        setPhotos([...photos, dummyPhoto]);
    };

    const PLACEHOLDER_IMG =
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop';

    const setStructuredPhoto = (key: 'front' | 'bar' | 'side') => {
        if (key === 'front') setPhotoFrontUrl(PLACEHOLDER_IMG);
        if (key === 'bar') setPhotoBarUrl(PLACEHOLDER_IMG);
        if (key === 'side') setPhotoSideUrl(PLACEHOLDER_IMG);
    };

    return (
        <section className="weekly-feedback-section">
            <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="title-area">
                    <ClipboardList className="header-icon" />
                    <div>
                        <h3>Weekly Check-in</h3>
                        <p>Share your progress and how you're feeling with your coach.</p>
                    </div>
                </div>
                <button className={`expand-btn ${isExpanded ? 'active' : ''}`}>
                    {isExpanded ? 'Collapse' : 'Log Weekly Progress'}
                </button>
            </div>

            {isExpanded && (
                <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Metabolism */}
                        <div className="form-group">
                            <label>How is your metabolism lately? (1-10)</label>
                            <div className="slider-wrapper">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={metabolism} 
                                    onChange={(e) => setMetabolism(Number(e.target.value))} 
                                />
                                <span className="range-value">{metabolism}</span>
                            </div>
                        </div>

                        {/* Hunger Level */}
                        <div className="form-group">
                            <label>Do you feel hungry? (1-10)</label>
                            <div className="slider-wrapper">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={hungerLevel} 
                                    onChange={(e) => setHungerLevel(Number(e.target.value))} 
                                />
                                <span className="range-value">{hungerLevel}</span>
                            </div>
                        </div>

                        {/* General Feeling */}
                        <div className="form-group">
                            <label>General Well-being & Mood (1-10)</label>
                            <div className="slider-wrapper">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={generalFeeling} 
                                    onChange={(e) => setGeneralFeeling(Number(e.target.value))} 
                                />
                                <span className="range-value">{generalFeeling}</span>
                            </div>
                        </div>

                        {/* Workout Duration */}
                        <div className="form-group">
                            <label>Average Workout Duration (Minutes)</label>
                            <input 
                                type="number" 
                                value={workoutDuration} 
                                onChange={(e) => setWorkoutDuration(Number(e.target.value))} 
                            />
                        </div>

                        {/* Workout Progression */}
                        <div className="form-group progression-select">
                            <label>How are your workouts feeling?</label>
                            <div className="btn-group">
                                <button 
                                    type="button" 
                                    className={workoutProgression === 'progressing' ? 'active' : ''}
                                    onClick={() => setWorkoutProgression('progressing')}
                                >
                                    Progressing
                                </button>
                                <button 
                                    type="button" 
                                    className={workoutProgression === 'stuck' ? 'active' : ''}
                                    onClick={() => setWorkoutProgression('stuck')}
                                >
                                    Feeling Stuck
                                </button>
                                <button 
                                    type="button" 
                                    className={workoutProgression === 'decreased' ? 'active' : ''}
                                    onClick={() => setWorkoutProgression('decreased')}
                                >
                                    Decreased
                                </button>
                            </div>
                        </div>

                        {/* Sleep */}
                        <div className="form-group">
                            <label>Average Sleep (Hours/Night)</label>
                            <input 
                                type="number" 
                                step="0.5" 
                                value={sleepAverage} 
                                onChange={(e) => setSleepAverage(Number(e.target.value))} 
                            />
                        </div>

                        <div className="form-group">
                            <label>Sleep quality (1–10)</label>
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={sleepQuality1to10}
                                    onChange={(e) => setSleepQuality1to10(Number(e.target.value))}
                                />
                                <span className="range-value">{sleepQuality1to10}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Satiety — how full/satisfied? (1–10)</label>
                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={satietyLevel1to10}
                                    onChange={(e) => setSatietyLevel1to10(Number(e.target.value))}
                                />
                                <span className="range-value">{satietyLevel1to10}</span>
                            </div>
                        </div>

                        <div className="form-group progression-select">
                            <label>Digestion this week</label>
                            <div className="btn-group">
                                <button
                                    type="button"
                                    className={digestion === 'good' ? 'active' : ''}
                                    onClick={() => setDigestion('good')}
                                >
                                    Good
                                </button>
                                <button
                                    type="button"
                                    className={digestion === 'ok' ? 'active' : ''}
                                    onClick={() => setDigestion('ok')}
                                >
                                    OK
                                </button>
                                <button
                                    type="button"
                                    className={digestion === 'poor' ? 'active' : ''}
                                    onClick={() => setDigestion('poor')}
                                >
                                    Poor
                                </button>
                            </div>
                        </div>

                        {/* Injury */}
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={injured} 
                                    onChange={(e) => setInjured(e.target.checked)} 
                                />
                                Did you suffer any injuries this week?
                            </label>
                            {injured && (
                                <textarea 
                                    placeholder="Please describe the injury..." 
                                    value={injuryDetails}
                                    onChange={(e) => setInjuryDetails(e.target.value)}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <div className="photo-section structured-poses">
                        <label>Progress photos — front, bar, side (optional)</label>
                        <div className="structured-photo-uploads">
                            {(
                                [
                                    { key: 'front' as const, label: 'Front', url: photoFrontUrl, set: setPhotoFrontUrl },
                                    { key: 'bar' as const, label: 'Bar', url: photoBarUrl, set: setPhotoBarUrl },
                                    { key: 'side' as const, label: 'Side', url: photoSideUrl, set: setPhotoSideUrl },
                                ] as const
                            ).map(({ key, label, url, set }) => (
                                <div key={key} className="structured-upload-row">
                                    <span className="pose-label">{label}</span>
                                    {url ? (
                                        <div className="photo-item small">
                                            <img src={url} alt={label} />
                                            <button type="button" className="remove-photo" onClick={() => set(undefined)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="add-photo-placeholder compact"
                                            onClick={() => setStructuredPhoto(key)}
                                        >
                                            <Camera size={20} />
                                            <span>Add {label}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="photo-section">
                        <label>Weekly Progress Photos — gallery (optional)</label>
                        <div className="photo-grid">
                            {photos.map((p, idx) => (
                                <div key={idx} className="photo-item">
                                    <img src={p} alt={`Progress ${idx}`} />
                                    <button 
                                        type="button" 
                                        className="remove-photo" 
                                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="add-photo-placeholder" onClick={handlePhotoAdd}>
                                <Camera size={24} />
                                <span>Add Photo</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-checkin">
                            Submit Weekly Check-in
                        </button>
                    </div>
                </form>
            )}

            {/* History Preview */}
            {!isExpanded && trainee.weeklyFeedback && trainee.weeklyFeedback.length > 0 && (
                <div className="feedback-history">
                    <p className="history-hint">
                        <Info size={14} />
                        Last check-in: {trainee.weeklyFeedback[0].date}
                    </p>
                </div>
            )}
        </section>
    );
};
