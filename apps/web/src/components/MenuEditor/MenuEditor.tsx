import { useMemo, useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import type { FoodItem } from '../../types';
import './MenuEditor.scss';

export const MenuEditor: React.FC = () => {
    const { foodDatabase, currentPlan, updatePlan } = useConfig();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFoods = useMemo(() => {
        if (!searchTerm) return [];
        const q = searchTerm.toLowerCase();
        return foodDatabase.filter((f) => f.item.toLowerCase().includes(q)).slice(0, 20);
    }, [foodDatabase, searchTerm]);

    const handleAddItem = (food: FoodItem) => {
        if (!currentPlan) return;
        const newItem: FoodItem = {
            ...food,
            id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        };
        updatePlan({
            ...currentPlan,
            dailyPlan: [...currentPlan.dailyPlan, newItem],
        });
    };

    return (
        <div className="menu-editor">
            <h3>Add to nutrition plan</h3>
            <input
                type="text"
                className="search-bar"
                placeholder="Search food…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="results-list">
                {filteredFoods.map((food) => (
                    <div key={food.id} className="food-item-card" onClick={() => handleAddItem(food)}>
                        <div className="info">
                            <h4 style={{ margin: 0 }}>{food.item}</h4>
                            <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.85rem' }}>
                                {food.calories} kcal · P {food.protein}g
                            </p>
                        </div>
                        <button type="button" title="Add">
                            +
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
