import React, { useState } from 'react';
import { ClipboardList, Trash2, Camera, Info } from 'lucide-react';
import type { Trainee, WeeklyFeedbackRecord } from '../../../types';
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
            workoutDuration,
            workoutProgression,
            photos
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
    };

    const handlePhotoAdd = () => {
        // Placeholder for real photo upload
        const dummyPhoto = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop";
        setPhotos([...photos, dummyPhoto]);
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

                    {/* Photos */}
                    <div className="photo-section">
                        <label>Weekly Progress Photos (Optional)</label>
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
