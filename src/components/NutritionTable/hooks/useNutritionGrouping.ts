import { useMemo, useState } from 'react';
import { type DropResult } from '@hello-pangea/dnd';
import type { FoodItem, NutritionPlan, AppConfig } from '../../../types';

export const useNutritionGrouping = (config: AppConfig | null | undefined, updatePlan: (plan: NutritionPlan) => void) => {
    // Keep track of meal sections that were manually added, even if empty
    const [addedMeals, setAddedMeals] = useState<number[]>([]);
    // Track editing title state
    const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
    const [tempTitle, setTempTitle] = useState('');

    const macroColumns = useMemo(() => {
        if (!config?.nutrition?.dailyPlan?.length) {
            return ['calories', 'protein', 'carbs', 'fat'];
        }
        const firstItem = config.nutrition.dailyPlan[0];
        return Object.keys(firstItem).filter(key =>
            key !== 'id' &&
            key !== 'item' &&
            key !== 'quantity' &&
            typeof firstItem[key] === 'number'
        );
    }, [config]);

    const groupedPlan = useMemo(() => {
        if (!config?.nutrition?.dailyPlan) return {};

        const groups: { [key: number]: FoodItem[] } = {};
        const otherItems: FoodItem[] = [];

        config.nutrition.dailyPlan.forEach(item => {
            const match = item.id.match(/^meal-(\d+)-/);
            if (match) {
                const mealNum = parseInt(match[1]);
                if (!groups[mealNum]) groups[mealNum] = [];
                groups[mealNum].push(item);
            } else {
                otherItems.push(item);
            }
        });

        if (otherItems.length > 0) {
            groups[999] = otherItems;
        }

        return groups;
    }, [config]);

    const sortedGroupKeys = useMemo(() => {
        const dataKeys = Object.keys(groupedPlan).map(Number);
        const titleKeys = config?.nutrition?.mealTitles ? Object.keys(config.nutrition.mealTitles).map(Number) : [];
        const allKeys = new Set([...dataKeys, ...addedMeals, ...titleKeys]);

        return Array.from(allKeys).sort((a, b) => a - b);
    }, [groupedPlan, addedMeals, config]);

    const getMealTitle = (mealNum: number) => {
        if (mealNum === 999) return "Uncategorized Items";
        if (config?.nutrition?.mealTitles && config.nutrition.mealTitles[mealNum]) {
            return config.nutrition.mealTitles[mealNum];
        }
        return `Meal ${mealNum}`;
    };

    const addMeal = () => {
        const keys = sortedGroupKeys.filter(k => k !== 999);
        const currentMax = keys.length > 0 ? Math.max(...keys) : 0;
        const nextMeal = currentMax + 1;

        setAddedMeals(prev => [...prev, nextMeal]);
        return nextMeal;
    };

    const updateMealTitle = (mealNum: number, title: string) => {
        if (!config?.nutrition || !updatePlan) return;

        const currentTitles = config.nutrition.mealTitles || {};
        const newTitles = { ...currentTitles };

        if (title.trim()) {
            newTitles[mealNum] = title;
        } else {
            delete newTitles[mealNum];
        }

        updatePlan({
            ...config.nutrition,
            mealTitles: newTitles
        });
        setEditingTitleId(null);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !config?.nutrition || !updatePlan) return;

        const sourceGroupMeal = parseInt(result.source.droppableId);
        const destGroupMeal = parseInt(result.destination.droppableId);

        const currentGroups: { [key: number]: FoodItem[] } = {};
        const otherItems: FoodItem[] = [];

        config.nutrition.dailyPlan.forEach(item => {
            const match = item.id.match(/^meal-(\d+)-/);
            if (match) {
                const num = parseInt(match[1]);
                if (!currentGroups[num]) currentGroups[num] = [];
                currentGroups[num].push(item);
            } else {
                otherItems.push(item);
            }
        });
        if (otherItems.length) currentGroups[999] = otherItems;

        if (!currentGroups[sourceGroupMeal]) currentGroups[sourceGroupMeal] = [];
        if (!currentGroups[destGroupMeal]) currentGroups[destGroupMeal] = [];

        const sourceList = currentGroups[sourceGroupMeal];
        if (result.source.index >= sourceList.length) return;

        const [movedItem] = sourceList.splice(result.source.index, 1);

        if (sourceGroupMeal === destGroupMeal) {
            sourceList.splice(result.destination.index, 0, movedItem);
        } else {
            let newItem = { ...movedItem };

            if (destGroupMeal !== 999) {
                const randomPart = Math.random().toString(36).substr(2, 9);
                newItem.id = `meal-${destGroupMeal}-${randomPart}`;
            } else {
                const randomPart = Math.random().toString(36).substr(2, 9);
                newItem.id = `item-${Date.now()}-${randomPart}`;
            }

            currentGroups[destGroupMeal].splice(result.destination.index, 0, newItem);
        }

        let newFlatPlan: FoodItem[] = [];
        Object.keys(currentGroups).map(Number).sort((a, b) => a - b).forEach(k => {
            newFlatPlan = [...newFlatPlan, ...currentGroups[k]];
        });

        // Ensure title persists? Yes, handled separately.
        updatePlan({
            ...config.nutrition,
            dailyPlan: newFlatPlan
        });
    };

    return {
        macroColumns,
        groupedPlan,
        sortedGroupKeys,
        handleDragEnd,
        addMeal,
        getMealTitle,
        edtiTitleState: {
            editingTitleId,
            setEditingTitleId,
            tempTitle,
            setTempTitle,
            updateMealTitle
        },
        updateMealTitle
    };
};
