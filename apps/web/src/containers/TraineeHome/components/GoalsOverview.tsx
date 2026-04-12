import React from 'react';
import { Target } from 'lucide-react';
import type { Trainee } from '../../../types';
import { useTrainee } from '../../../context/TraineeContext';
import './GoalsOverview.scss';

interface IPropsGoalsOverview {
    activeTrainee: Trainee | undefined;
    /** Coach trainee modal: show water jug + amount only */
    waterVariant?: 'interactive' | 'readOnly';
}

export const GoalsOverview: React.FC<IPropsGoalsOverview> = ({ activeTrainee, waterVariant = 'interactive' }) => {
    const { updateTrainee } = useTrainee();

    const goals = activeTrainee?.goals;

    const handleAddWater = (amount: number) => {
        if (!activeTrainee) return;
        const currentIntake = activeTrainee.waterIntake || 0;
        const newTotal = Math.max(0, currentIntake + amount); // Prevent negative water intake
        
        updateTrainee(activeTrainee.id, {
            ...activeTrainee,
            waterIntake: newTotal
        });
    };

    const waterIntake = activeTrainee?.waterIntake || 0;
    const waterTarget = goals?.waterTarget || 3000;
    const waterIntakeLiters = (waterIntake / 1000).toFixed(2);
    const targetLiters = (waterTarget / 1000).toFixed(1);
    const fillPercentage = Math.min(100, Math.round((waterIntake / waterTarget) * 100));

    const currentWeight = activeTrainee?.metrics?.weight || 0;
    const targetWeight = goals?.targetWeight || 0;
    
    let distanceText = '';
    if (currentWeight && targetWeight) {
        const diff = currentWeight - targetWeight;
        if (Math.abs(diff) < 0.1) {
            distanceText = 'Goal reached!';
        } else if (diff > 0) {
            distanceText = `${diff.toFixed(1)}kg left`;
        } else {
            distanceText = `${Math.abs(diff).toFixed(1)}kg left`;
        }
    }

    return (
        <div className="goals-overview-container">
            <div className="goal-card target-weight">
                <div className="icon-wrapper" style={{ background: 'rgba(0, 242, 255, 0.1)', color: '#00f2ff' }}>
                    <Target size={24} />
                </div>
                <div className="metric">
                    <div className="metric-header">
                        <h4>Target Weight</h4>
                        {distanceText && (
                            <span className={`distance-badge ${distanceText === 'Goal reached!' ? 'reached' : ''}`}>
                                {distanceText}
                            </span>
                        )}
                    </div>
                    <span className="value">{goals?.targetWeight || '--'} <small>kg</small></span>
                </div>
            </div>

            <div className="goal-card water-tracker">
                <div className="water-can-visual">
                    <div className="water-fill" style={{ height: `${fillPercentage}%` }}>
                        <div className="water-wave"></div>
                    </div>
                </div>
                <div className="metric">
                    <div className="metric-header">
                        <h4>Water Today</h4>
                        <span className="distance-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                            {fillPercentage}%
                        </span>
                    </div>
                    <span className="value">
                        {waterIntakeLiters} <small> / {targetLiters}L</small>
                    </span>
                </div>
                {waterVariant === 'interactive' && (
                    <div className="water-actions">
                        <button
                            type="button"
                            className="add-water-btn add"
                            onClick={() => handleAddWater(250)}
                            title="Add 250ml"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            className="add-water-btn remove"
                            onClick={() => handleAddWater(-250)}
                            disabled={(activeTrainee?.waterIntake || 0) <= 0}
                            title="Remove 250ml"
                        >
                            -
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
