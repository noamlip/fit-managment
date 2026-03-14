import React, { useMemo } from 'react';
import { useNutrition } from '../../../hooks/useNutrition';
import type { FoodItem } from '../../../types';

interface MealTotalsRowProps {
    items: FoodItem[];
    columns: string[];
    isGrandTotal?: boolean;
    trainerName: string | null;
}

export const MealTotalsRow: React.FC<MealTotalsRowProps> = ({ items, columns, isGrandTotal, trainerName }) => {
    // Create a temporary plan object to reuse the hook
    const tempPlan = useMemo(() => ({ dailyPlan: items }), [items]);
    const { totals } = useNutrition(tempPlan);

    return (
        <tfoot>
            <tr>
                {trainerName && <td></td>}
                <td colSpan={2} className={`total-label ${isGrandTotal ? 'grand-total-label' : ''}`} style={isGrandTotal ? { fontSize: '1.2rem' } : undefined}>
                    {isGrandTotal ? 'Daily Total' : 'Meal Total'}
                </td>
                {columns.map(col => (
                    <td key={col} className={`total-value ${isGrandTotal ? 'grand-total-value' : ''}`} style={isGrandTotal ? { fontSize: '1.2rem' } : undefined}>
                        {totals[col]?.toFixed(1) || 0}
                    </td>
                ))}
                {trainerName && <td></td>}
            </tr>
        </tfoot>
    );
};
