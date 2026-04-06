import React, { useState } from 'react';
import type { Trainee } from '../../types';

interface INutritionTabProps {
    trainee: Trainee;
    onUpdate: (id: string, data: Partial<Trainee>) => void;
    onEditMenu: () => void;
}

export const NutritionTab: React.FC<INutritionTabProps> = ({ trainee, onUpdate, onEditMenu }) => {
    const [macros, setMacros] = useState({
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
                    <input type="number" value={macros.protein} onChange={(e) => handleChange(e, 'protein')} />
                </div>
                <div className="macro-card">
                    <label>Carbs (g)</label>
                    <input type="number" value={macros.carbs} onChange={(e) => handleChange(e, 'carbs')} />
                </div>
                <div className="macro-card">
                    <label>Fats (g)</label>
                    <input type="number" value={macros.fatt} onChange={(e) => handleChange(e, 'fatt')} />
                </div>
                <div className="macro-card">
                    <label>Water (ml)</label>
                    <input type="number" step="250" value={macros.water} onChange={(e) => handleChange(e, 'water')} />
                </div>
            </div>
            <button className="edit-plan-btn" onClick={onEditMenu}>
                Edit Daily Menu
            </button>
        </div>
    );
};
