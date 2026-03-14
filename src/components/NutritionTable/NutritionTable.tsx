import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useConfig } from '../../context/ConfigContext';
import { useNutritionGrouping } from './hooks/useNutritionGrouping';
import { useNutritionEditing } from './hooks/useNutritionEditing';
import { MealGroup } from './components/MealGroup';
import { MealTotalsRow } from './components/MealTotalsRow';
import { FoodSearchModal } from './components/FoodSearchModal';
import './NutritionTable.scss';
import './components/FoodSearchModal.scss'; // Ensure styles are imported
import type { FoodItem } from '../../types';

export const NutritionTable: React.FC = () => {
    const {
        config, loading, error, trainerName, userRole,
        selectedTrainee, knownTrainers, selectTrainee, updatePlan
    } = useConfig();

    // Hooks should gracefully handle null config
    const {
        macroColumns,
        groupedPlan,
        sortedGroupKeys,
        handleDragEnd,
        addMeal,
        getMealTitle,
        edtiTitleState: { editingTitleId, setEditingTitleId, tempTitle, setTempTitle, updateMealTitle }
    } = useNutritionGrouping(config, updatePlan);

    const {
        editingId,
        editValues,
        handleEdit,
        handleCancel,
        handleSave,
        handleChange,
        handleDelete
    } = useNutritionEditing(config, updatePlan, macroColumns);

    // State for creating new meal
    const [isCreatingMeal, setIsCreatingMeal] = useState(false);
    const [newMealName, setNewMealName] = useState('');

    // State for Adding Food to Meal
    const [addingFoodToMeal, setAddingFoodToMeal] = useState<number | null>(null);

    if (loading) return <div className="nutrition-container"><div className="loading-container"><div className="spinner"></div>Loading Plan...</div></div>;
    if (error) return <div className="nutrition-container"><div className="error-container">Error: {error.message}</div></div>;

    // --- Coach Selection View ---
    if (userRole === 'coach' && !selectedTrainee) {
        return (
            <div className="nutrition-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ color: '#00C49F', marginBottom: '1.5rem' }}>Select a Trainee to Manage</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {knownTrainers.length > 0 ? (
                        knownTrainers.map(trainee => (
                            <button
                                key={trainee}
                                onClick={() => selectTrainee(trainee)}
                                style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(0, 196, 159, 0.3)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 196, 159, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                {trainee}
                            </button>
                        ))
                    ) : (
                        <p style={{ gridColumn: '1 / -1', color: '#888' }}>
                            No trainees have logged in yet on this device.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!config) return null;

    const handleCreateMealClick = () => {
        setIsCreatingMeal(true);
        setNewMealName('');
    }

    const handleConfirmCreateMeal = () => {
        if (!newMealName.trim()) {
            setIsCreatingMeal(false);
            return;
        }

        const keys = sortedGroupKeys.filter(k => k !== 999);
        const currentMax = keys.length > 0 ? Math.max(...keys) : 0;
        const nextMeal = currentMax + 1;

        addMeal();
        updateMealTitle(nextMeal, newMealName);

        setIsCreatingMeal(false);
    }

    const handleSwitchTrainee = () => {
        selectTrainee('');
    };

    const handleAddFoodSelect = (food: FoodItem) => {
        if (!config?.nutrition || !updatePlan || addingFoodToMeal === null) return;

        // Create new item for target meal
        const randomPart = Math.random().toString(36).substr(2, 9);
        const newItem: FoodItem = {
            ...food,
            id: addingFoodToMeal === 999
                ? `item-${Date.now()}-${randomPart}`
                : `meal-${addingFoodToMeal}-${randomPart}`
        };

        updatePlan({
            ...config.nutrition,
            dailyPlan: [...config.nutrition.dailyPlan, newItem]
        });

        setAddingFoodToMeal(null); // Close modal
    };

    return (
        <div className="nutrition-container">
            {/* Coach Header: Allowing switching back */}
            {userRole === 'coach' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ margin: 0 }}>Managing: <span style={{ color: '#00C49F' }}>{selectedTrainee}</span></h3>
                    <button
                        onClick={handleSwitchTrainee}
                        className="action-btn"
                        style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Switch Trainee
                    </button>
                </div>
            )}

            <div className="meal-section grand-total-section">
                <table className="nutrition-table">
                    <MealTotalsRow
                        items={config.nutrition.dailyPlan}
                        columns={macroColumns}
                        isGrandTotal
                        trainerName={trainerName}
                    />
                </table>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                {sortedGroupKeys.map(mealNum => (
                    <MealGroup
                        key={mealNum}
                        mealNum={mealNum}
                        items={groupedPlan[mealNum] || []}
                        macroColumns={macroColumns}
                        trainerName={trainerName}
                        title={getMealTitle(mealNum)}

                        editingTitleId={editingTitleId}
                        tempTitle={tempTitle}
                        setEditingTitleId={setEditingTitleId}
                        setTempTitle={setTempTitle}
                        updateMealTitle={updateMealTitle}

                        editingId={editingId}
                        editValues={editValues}
                        handlers={{
                            onEdit: handleEdit,
                            onSave: handleSave,
                            onCancel: handleCancel,
                            onDelete: handleDelete,
                            onChange: handleChange
                        }}
                        // Pass Add Food Trigger
                        onAddFoodClick={() => setAddingFoodToMeal(mealNum)}
                    />
                ))}
            </DragDropContext>

            {/* Create Meal Section */}
            {trainerName && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    {isCreatingMeal ? (
                        <div style={{ display: 'inline-flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid #00C49F' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Enter Meal Name"
                                value={newMealName}
                                onChange={e => setNewMealName(e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    outline: 'none',
                                    minWidth: '250px'
                                }}
                                onKeyDown={e => e.key === 'Enter' && handleConfirmCreateMeal()}
                            />
                            <button onClick={handleConfirmCreateMeal} className="action-btn save" style={{ fontSize: '1.2rem' }}>✓</button>
                            <button onClick={() => setIsCreatingMeal(false)} className="action-btn cancel" style={{ fontSize: '1.2rem' }}>✕</button>
                        </div>
                    ) : (
                        <button
                            onClick={handleCreateMealClick}
                            style={{
                                padding: '0.8rem 1.5rem',
                                fontSize: '1rem',
                                background: 'rgba(0, 196, 159, 0.2)',
                                border: '1px solid #00C49F',
                                color: '#00C49F',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 196, 159, 0.4)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 196, 159, 0.2)'}
                        >
                            + Create Another Meal
                        </button>
                    )}
                </div>
            )}

            {/* Food Search Modal */}
            <FoodSearchModal
                isOpen={addingFoodToMeal !== null}
                onClose={() => setAddingFoodToMeal(null)}
                targetMealTitle={addingFoodToMeal !== null ? getMealTitle(addingFoodToMeal) : ''}
                onSelect={handleAddFoodSelect}
            />
        </div>
    );
};
