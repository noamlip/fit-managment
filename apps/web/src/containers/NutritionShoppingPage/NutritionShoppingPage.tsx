import { useMemo, useState, type FC } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import {
    flattenFoodItems,
    getDayTypeForDate,
    getMealsForPlanDate,
    tryScaleQuantityString,
    NUTRITION_SHOPPING_DATE_KEY,
} from '../../lib/nutritionDayMeals';
import './NutritionShoppingPage.scss';

interface NutritionShoppingPageProps {
    onBack: () => void;
}

export const NutritionShoppingPage: FC<NutritionShoppingPageProps> = ({ onBack }) => {
    const { currentPlan, userRole, trainerName, selectedTrainee } = useConfig();
    const { trainees } = useTrainee();

    const [days, setDays] = useState(7);

    const activeTraineeName = userRole === 'coach' ? selectedTrainee : trainerName;
    const activeTrainee = useMemo(
        () => trainees.find((t) => t.name === activeTraineeName),
        [trainees, activeTraineeName]
    );

    const selectedDate = useMemo(() => {
        try {
            const raw = sessionStorage.getItem(NUTRITION_SHOPPING_DATE_KEY);
            if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        } catch {
            /* ignore */
        }
        return new Date().toISOString().split('T')[0];
    }, []);

    const rows = useMemo(() => {
        if (!currentPlan) return [];
        const dayType = getDayTypeForDate(currentPlan, activeTrainee, selectedDate);
        const meals = getMealsForPlanDate(currentPlan, selectedDate, dayType);
        return flattenFoodItems(meals).map((f) => ({
            id: f.id,
            item: f.item,
            quantity: String(f.quantity ?? ''),
            calories: Number(f.calories) || 0,
            protein: Number(f.protein) || 0,
            carbs: Number(f.carbs) || 0,
            fat: Number(f.fat) || 0,
        }));
    }, [currentPlan, activeTrainee, selectedDate]);

    if (!currentPlan) {
        return (
            <div className="nutrition-shopping-page">
                <button type="button" className="nutrition-shopping-back" onClick={onBack}>
                    <ArrowLeft size={20} /> Back
                </button>
                <p className="nutrition-shopping-muted">Loading plan…</p>
            </div>
        );
    }

    return (
        <div className="nutrition-shopping-page">
            <header className="nutrition-shopping-head">
                <button type="button" className="nutrition-shopping-back" onClick={onBack}>
                    <ArrowLeft size={20} /> Back to nutrition
                </button>
                <div className="nutrition-shopping-title-row">
                    <ShoppingCart size={26} className="nutrition-shopping-icon" aria-hidden />
                    <div>
                        <h1 className="nutrition-shopping-title">Shopping list</h1>
                        <p className="nutrition-shopping-sub">
                            Based on your menu for <strong>{selectedDate}</strong>. Enter how many days you are
                            shopping for — quantities scale from one day&apos;s plan.
                        </p>
                    </div>
                </div>
            </header>

            <section className="nutrition-shopping-controls">
                <label htmlFor="shop-days">Days to shop for</label>
                <input
                    id="shop-days"
                    type="number"
                    min={1}
                    max={90}
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Math.min(90, parseInt(e.target.value, 10) || 1)))}
                />
            </section>

            <div className="nutrition-shopping-table-wrap">
                <table className="nutrition-shopping-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Per day</th>
                            <th>To buy ({days} days)</th>
                            <th className="nutrition-shopping-macros">kcal · P · C · F (per day)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const scaled =
                                tryScaleQuantityString(row.quantity, days) ??
                                `${row.quantity} × ${days} days`;
                            const macroLine = `${Math.round(row.calories)} kcal · P ${row.protein.toFixed(1)} · C ${row.carbs.toFixed(1)} · F ${row.fat.toFixed(1)}`;
                            return (
                                <tr key={row.id}>
                                    <td className="nutrition-shopping-item">{row.item}</td>
                                    <td className="nutrition-shopping-qty">{row.quantity}</td>
                                    <td className="nutrition-shopping-buy">{scaled}</td>
                                    <td className="nutrition-shopping-macros">{macroLine}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {rows.length === 0 && (
                <p className="nutrition-shopping-muted">No foods in this day&apos;s plan yet.</p>
            )}
        </div>
    );
};
