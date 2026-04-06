import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { FoodItem } from '../../../types';
import { NutritionRow } from './NutritionRow';
import { MealTotalsRow } from './MealTotalsRow';

interface MealGroupProps {
    mealNum: number;
    items: FoodItem[];
    macroColumns: string[];
    trainerName: string | null;
    title: string;
    // Meal Editing Props
    editingTitleId: number | null;
    tempTitle: string;
    setEditingTitleId: (id: number | null) => void;
    setTempTitle: (title: string) => void;
    updateMealTitle: (id: number, title: string) => void;

    // Item Editing Props
    editingId: string | null;
    editValues: Partial<FoodItem>;
    handlers: {
        onEdit: (item: FoodItem) => void;
        onSave: () => void;
        onCancel: () => void;
        onDelete: (id: string) => void;
        onChange: (field: string, value: string | number) => void;
    };
    onAddFoodClick?: () => void;
}

export const MealGroup: React.FC<MealGroupProps> = ({
    mealNum, items, macroColumns, trainerName, title,
    editingTitleId, tempTitle, setEditingTitleId, setTempTitle, updateMealTitle,
    editingId, editValues, handlers, onAddFoodClick
}) => {
    // Determine if this specific meal title is being edited
    const isEditingTitle = editingTitleId === mealNum;

    const handleTitleSave = () => {
        updateMealTitle(mealNum, tempTitle);
        setEditingTitleId(null);
    };

    const handleTitleCancel = () => {
        setEditingTitleId(null);
    };

    const startEditingTitle = () => {
        setTempTitle(title);
        setEditingTitleId(mealNum);
    };

    return (
        <div className="meal-section">
            <div className="meal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    {isEditingTitle && trainerName ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid #00C49F',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '1.4rem'
                                }}
                                autoFocus
                            />
                            <button onClick={handleTitleSave} className="action-btn save">✓</button>
                            <button onClick={handleTitleCancel} className="action-btn cancel">✕</button>
                        </div>
                    ) : (
                        <h3 className="meal-title" style={{ marginBottom: 0 }}>
                            {title}
                            {trainerName && mealNum !== 999 && (
                                <button
                                    onClick={startEditingTitle}
                                    className="action-btn edit"
                                    style={{ marginLeft: '1rem', fontSize: '1rem', opacity: 0.7 }}
                                    title="Edit Meal Name"
                                >
                                    ✎
                                </button>
                            )}
                        </h3>
                    )}
                </div>

                {trainerName && onAddFoodClick && (
                    <button
                        onClick={onAddFoodClick}
                        style={{
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(0, 196, 159, 0.2)',
                            border: '1px solid #00C49F',
                            borderRadius: '6px',
                            color: '#00C49F',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            fontSize: '0.9rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 196, 159, 0.4)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 196, 159, 0.2)'}
                    >
                        + Add Food
                    </button>
                )}
            </div>

            <table className="nutrition-table">
                <thead>
                    <tr>
                        {trainerName && <th></th>}
                        <th>Food Item</th>
                        <th>Quantity</th>
                        {macroColumns.map(col => (
                            <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
                        ))}
                        {trainerName && <th>Actions</th>}
                    </tr>
                </thead>
                <Droppable droppableId={String(mealNum)}>
                    {(provided) => (
                        <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {items.map((meal, index) => (
                                <NutritionRow
                                    key={meal.id}
                                    item={meal}
                                    index={index}
                                    macroColumns={macroColumns}
                                    trainerName={trainerName}
                                    isEditing={editingId === meal.id}
                                    editValues={editValues}
                                    onEdit={handlers.onEdit}
                                    onSave={handlers.onSave}
                                    onCancel={handlers.onCancel}
                                    onDelete={handlers.onDelete}
                                    onChange={handlers.onChange}
                                />
                            ))}
                            {provided.placeholder}
                        </tbody>
                    )}
                </Droppable>
                <MealTotalsRow items={items} columns={macroColumns} trainerName={trainerName} />
            </table>
        </div>
    );
};
