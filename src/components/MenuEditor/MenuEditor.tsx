import React, { useState, useMemo } from 'react';
import { useConfig } from '../../context/ConfigContext';
import type { FoodItem } from '../../types';
import './MenuEditor.scss';

export const MenuEditor: React.FC = () => {
    const { foodDatabase, currentPlan, updatePlan } = useConfig();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFoods = useMemo(() => {
        if (!searchTerm) return [];
        return foodDatabase.filter(food =>
            food.item.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 20); // Limit results for performance
    }, [foodDatabase, searchTerm]);

    const handleAddItem = (food: FoodItem) => {
        if (!currentPlan) return;

        // Create a unique ID for the new instance
        const newItem: FoodItem = {
            ...food,
            id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        updatePlan({
            ...currentPlan,
            dailyPlan: [...currentPlan.dailyPlan, newItem]
        });
    };

    return (
        <div className="menu-editor">
            <h3>Add to Nutrition Plan</h3>
            <input
                type="text"
                className="search-bar"
                placeholder="Search food database (e.g. 'Chicken', 'Rice')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="results-list">
                {filteredFoods.map(food => (
                    <div key={food.id} className="food-item-card" onClick={() => handleAddItem(food)}>
                        <div className="info">
                            <h4>{food.item}</h4>
                            <p>
                                <span>{food.calories} kcal</span>
                                P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                            </p>
                        </div>
                        <button title="Add to plan">+</button>
                    </div>
                ))}
                {searchTerm && filteredFoods.length === 0 && (
                    <p style={{ color: '#a0a0a0', textAlign: 'center', gridColumn: '1/-1' }}>
                        No matches found.
                    </p>
                )}
            </div>
        </div>
    );
};
