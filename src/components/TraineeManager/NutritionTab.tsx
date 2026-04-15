import React, { useState } from 'react';
import type { Trainee } from '../../types';

interface INutritionTabProps {
    trainee: Trainee;
    onUpdate: (id: string, data: Partial<Trainee>) => void;
    onEditMenu: () => void;
}

export const NutritionTab: React.FC<INutritionTabProps> = ({ trainee, onUpdate, onEditMenu }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [macros, setMacros] = useState({
        calories: trainee.goals.dailyCalories || 2000,
        protein: trainee.goals.proteinTarget || 180,
        carbs: trainee.goals.carbsTarget || 200,
        fatt: trainee.goals.fatTarget || 70,
        water: trainee.goals.waterTarget || 3000
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const val = parseInt(e.target.value) || 0;
        const newMacros = { ...macros, [key]: val };
        setMacros(newMacros);
        onUpdate(trainee.id, {
            goals: {
                ...trainee.goals,
                dailyCalories: newMacros.calories,
                proteinTarget: newMacros.protein,
                carbsTarget: newMacros.carbs,
                fatTarget: newMacros.fatt,
                waterTarget: newMacros.water
            }
        });
    };

    return (
        <div className="nutrition-assignment">
            <h3>Nutrition Plan Targets</h3>
            <div className="macros-overview">
                <div className="macro-card">
                    <label>Protein (g)</label>
                    {isEditing ? (
                        <input type="number" value={macros.protein} onChange={(e) => handleChange(e, 'protein')} />
                    ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{macros.protein}</span>
                    )}
                </div>
                <div className="macro-card">
                    <label>Carbs (g)</label>
                    {isEditing ? (
                        <input type="number" value={macros.carbs} onChange={(e) => handleChange(e, 'carbs')} />
                    ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{macros.carbs}</span>
                    )}
                </div>
                <div className="macro-card">
                    <label>Fats (g)</label>
                    {isEditing ? (
                        <input type="number" value={macros.fatt} onChange={(e) => handleChange(e, 'fatt')} />
                    ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{macros.fatt}</span>
                    )}
                </div>
                <div className="macro-card">
                    <label>Water (ml)</label>
                    {isEditing ? (
                        <input type="number" step="250" value={macros.water} onChange={(e) => handleChange(e, 'water')} />
                    ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{macros.water}</span>
                    )}
                </div>
                <div className="macro-card">
                    <label>Calories (kcal)</label>
                    {isEditing ? (
                        <input type="number" step="100" value={macros.calories} onChange={(e) => handleChange(e, 'calories')} />
                    ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{macros.calories}</span>
                    )}
                </div>
            </div>
            <button className="edit-plan-btn" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Save Changes' : 'Edit Daily Menu'}
            </button>
        </div>
    );
};
