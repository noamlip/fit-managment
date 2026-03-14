import React, { useState, useMemo } from 'react';
import { useConfig } from '../../../context/ConfigContext';
import { X } from 'lucide-react';
import type { FoodItem } from '../../../types';
// Reuse existing styles or add fresh simple ones
import './FoodSearchModal.scss';

interface FoodSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (food: FoodItem) => void;
    targetMealTitle: string;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onSelect, targetMealTitle }) => {
    const { foodDatabase } = useConfig();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFoods = useMemo(() => {
        if (!searchTerm) return [];
        return foodDatabase.filter(food =>
            food.item.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 20);
    }, [foodDatabase, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="food-search-modal-overlay">
            <div className="food-search-modal">
                <div className="modal-header">
                    <h3>Add to {targetMealTitle}</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search food database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                <div className="results-list">
                    {filteredFoods.map(food => (
                        <div key={food.id} className="food-result" onClick={() => onSelect(food)}>
                            <div className="info">
                                <span className="name">{food.item}</span>
                                <span className="macros">
                                    {food.calories}kcal | P:{food.protein} C:{food.carbs} F:{food.fat}
                                </span>
                            </div>
                            <button className="add-btn">+</button>
                        </div>
                    ))}
                    {searchTerm && filteredFoods.length === 0 && (
                        <p className="no-results">No matches found.</p>
                    )}
                    {!searchTerm && (
                        <p className="hint">Type to search...</p>
                    )}
                </div>
            </div>
        </div>
    );
};
