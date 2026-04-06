import React, { useState, useEffect } from 'react';
import { useTrainee } from '../../context/TraineeContext';
import { X } from 'lucide-react';
import './TraineeDashboard.scss'; // Reusing styles for now, or new file if needed? Let's use inline for modal specific or add to scss
import type { TraineeMetrics } from '../../types';

interface AddTraineeModalProps {
    onClose: () => void;
}

export const AddTraineeModal: React.FC<AddTraineeModalProps> = ({ onClose }) => {
    const { addTrainee, calculateStats } = useTrainee();

    const [name, setName] = useState('');
    const [metrics, setMetrics] = useState<TraineeMetrics>({
        age: 30,
        height: 175,
        weight: 75,
        gender: 'male',
        activityLevel: 1.375
    });
    const [calculated, setCalculated] = useState({ bmi: 0, bmr: 0, tdee: 0 });

    // Live calculation
    useEffect(() => {
        setCalculated(calculateStats(metrics));
    }, [metrics, calculateStats]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addTrainee({
            name,
            image: '',
            startDate: new Date().toISOString().split('T')[0],
            metrics,
            goals: {
                targetWeight: metrics.weight, // Default to current
                dailyCalories: calculated.tdee, // Maintenance
                waterTarget: 3000 // Default 3L
            }
        });

        onClose();
    };

    const handleMetricChange = (field: keyof TraineeMetrics, value: string | number) => {
        setMetrics(prev => ({
            ...prev,
            [field]: field === 'gender' ? value : Number(value)
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add New Trainee</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="metrics-grid">
                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                value={metrics.gender}
                                onChange={e => handleMetricChange('gender', e.target.value)}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                value={metrics.age}
                                onChange={e => handleMetricChange('age', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                value={metrics.height}
                                onChange={e => handleMetricChange('height', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                value={metrics.weight}
                                onChange={e => handleMetricChange('weight', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Activity Level</label>
                        <select
                            value={metrics.activityLevel}
                            onChange={e => handleMetricChange('activityLevel', parseFloat(e.target.value))}
                        >
                            <option value={1.2}>Sedentary (Office job)</option>
                            <option value={1.375}>Light Exercise (1-2 days/week)</option>
                            <option value={1.55}>Moderate Exercise (3-5 days/week)</option>
                            <option value={1.725}>Heavy Exercise (6-7 days/week)</option>
                            <option value={1.9}>Athlete (2x per day)</option>
                        </select>
                    </div>

                    <div className="live-stats">
                        <div className="stat-box">
                            <label>BMI</label>
                            <span>{calculated.bmi}</span>
                        </div>
                        <div className="stat-box">
                            <label>BMR</label>
                            <span>{calculated.bmr}</span>
                        </div>
                        <div className="stat-box highlight">
                            <label>Maintenance (TDEE)</label>
                            <span>{calculated.tdee} kcal</span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn">Create Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
