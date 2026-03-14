import { useState } from 'react';
import type { FoodItem, NutritionPlan } from '../../../types';

export const useNutritionEditing = (config: { nutrition: NutritionPlan } | null | undefined, updatePlan: (plan: NutritionPlan) => void, macroColumns: string[]) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<FoodItem>>({});

    const handleEdit = (item: FoodItem) => {
        setEditingId(item.id);
        setEditValues({ ...item });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSave = () => {
        if (!config?.nutrition || !updatePlan || !editingId) return;

        const newDailyPlan = config.nutrition.dailyPlan.map(item => {
            if (item.id === editingId) {
                const updatedItem = { ...item, ...editValues } as FoodItem;
                macroColumns.forEach(col => {
                    // @ts-ignore
                    updatedItem[col] = Number(updatedItem[col]);
                });
                return updatedItem;
            }
            return item;
        });

        updatePlan({
            ...config.nutrition,
            dailyPlan: newDailyPlan
        });

        setEditingId(null);
        setEditValues({});
    };

    const handleChange = (field: string, value: string | number) => {
        setEditValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDelete = (id: string) => {
        if (!config || !updatePlan || !config.nutrition) return;
        const newPlan = {
            ...config.nutrition,
            dailyPlan: config.nutrition.dailyPlan.filter(item => item.id !== id)
        };
        updatePlan(newPlan);
    };

    return {
        editingId,
        editValues,
        handleEdit,
        handleCancel,
        handleSave,
        handleChange,
        handleDelete
    };
};
