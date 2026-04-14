import { useMemo, useState, type FC } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useNutritionPlanCommit } from '../../context/NutritionPlanCommitContext';
import type { FoodItem, Meal, NutritionPlan } from '../../types';
import './NutritionTable.scss';

function newFoodId(): string {
    return `food-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newMealId(): string {
    return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sumMacros(items: FoodItem[]) {
    const n = (v: unknown) => {
        const x = Number(v);
        return Number.isFinite(x) ? x : 0;
    };
    return items.reduce(
        (acc, f) => ({
            calories: acc.calories + n(f.calories),
            protein: acc.protein + n(f.protein),
            carbs: acc.carbs + n(f.carbs),
            fat: acc.fat + n(f.fat),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
}

export const NutritionTable: FC = () => {
    const { foodDatabase, currentPlan } = useConfig();
    const { commitPlan } = useNutritionPlanCommit();
    const [searchByMeal, setSearchByMeal] = useState<Record<string, string>>({});

    const meals = currentPlan?.meals ?? [];

    const dayTotals = useMemo(() => {
        const all = meals.flatMap((m) => m.items);
        return sumMacros(all);
    }, [meals]);

    const setPlan = (next: NutritionPlan) => {
        commitPlan(next);
    };

    const updateMealTitle = (mealId: string, title: string) => {
        if (!currentPlan) return;
        setPlan({
            ...currentPlan,
            meals: currentPlan.meals.map((m) => (m.id === mealId ? { ...m, title } : m)),
        });
    };

    const removeMeal = (mealId: string) => {
        if (!currentPlan) return;
        const meal = currentPlan.meals.find((m) => m.id === mealId);
        if (!meal) return;
        if (meal.items.length > 0 && !confirm('Remove this meal and all its foods?')) return;
        const nextMeals = currentPlan.meals.filter((m) => m.id !== mealId);
        setPlan({
            ...currentPlan,
            meals:
                nextMeals.length > 0
                    ? nextMeals
                    : [{ id: newMealId(), title: 'Meal 1', items: [] }],
        });
    };

    const addMeal = () => {
        if (!currentPlan) return;
        const n = currentPlan.meals.length + 1;
        setPlan({
            ...currentPlan,
            meals: [...currentPlan.meals, { id: newMealId(), title: `Meal ${n}`, items: [] }],
        });
    };

    const removeFood = (mealId: string, foodId: string) => {
        if (!currentPlan) return;
        setPlan({
            ...currentPlan,
            meals: currentPlan.meals.map((m) =>
                m.id === mealId ? { ...m, items: m.items.filter((f) => f.id !== foodId) } : m
            ),
        });
    };

    const updateFoodField = (
        mealId: string,
        foodId: string,
        field: keyof FoodItem,
        value: string | number
    ) => {
        if (!currentPlan) return;
        setPlan({
            ...currentPlan,
            meals: currentPlan.meals.map((m) => {
                if (m.id !== mealId) return m;
                return {
                    ...m,
                    items: m.items.map((f) => {
                        if (f.id !== foodId) return f;
                        const next = { ...f, [field]: value } as FoodItem;
                        return next;
                    }),
                };
            }),
        });
    };

    const addFoodToMeal = (mealId: string, food: FoodItem) => {
        if (!currentPlan) return;
        const newItem: FoodItem = {
            ...food,
            id: newFoodId(),
        };
        setPlan({
            ...currentPlan,
            meals: currentPlan.meals.map((m) =>
                m.id === mealId ? { ...m, items: [...m.items, newItem] } : m
            ),
        });
        setSearchByMeal((prev) => ({ ...prev, [mealId]: '' }));
    };

    if (!currentPlan) {
        return (
            <div className="nutrition-table-wrap">
                <p style={{ color: '#888' }}>Loading nutrition plan…</p>
            </div>
        );
    }

    return (
        <div className="nutrition-panel">
            <h2 className="nutrition-panel-title">Daily nutrition</h2>

            {meals.map((meal) => (
                <MealBlock
                    key={meal.id}
                    meal={meal}
                    foodDatabase={foodDatabase}
                    searchTerm={searchByMeal[meal.id] ?? ''}
                    onSearchChange={(q) => setSearchByMeal((prev) => ({ ...prev, [meal.id]: q }))}
                    onTitleChange={(title) => updateMealTitle(meal.id, title)}
                    onRemoveMeal={() => removeMeal(meal.id)}
                    onRemoveFood={(foodId) => removeFood(meal.id, foodId)}
                    onUpdateFood={(foodId, field, value) =>
                        updateFoodField(meal.id, foodId, field, value)
                    }
                    onAddFood={(food) => addFoodToMeal(meal.id, food)}
                />
            ))}

            <button type="button" className="nutrition-add-meal" onClick={addMeal}>
                Add meal
            </button>

            <div className="nutrition-day-total">
                <strong>Day total</strong>
                <span>
                    {Math.round(dayTotals.calories)} kcal · P {dayTotals.protein.toFixed(1)} · C{' '}
                    {dayTotals.carbs.toFixed(1)} · F {dayTotals.fat.toFixed(1)}
                </span>
            </div>
        </div>
    );
};

interface MealBlockProps {
    meal: Meal;
    foodDatabase: FoodItem[];
    searchTerm: string;
    onSearchChange: (q: string) => void;
    onTitleChange: (title: string) => void;
    onRemoveMeal: () => void;
    onRemoveFood: (foodId: string) => void;
    onUpdateFood: (foodId: string, field: keyof FoodItem, value: string | number) => void;
    onAddFood: (food: FoodItem) => void;
}

function MealBlock({
    meal,
    foodDatabase,
    searchTerm,
    onSearchChange,
    onTitleChange,
    onRemoveMeal,
    onRemoveFood,
    onUpdateFood,
    onAddFood,
}: MealBlockProps) {
    const filteredFoods = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const q = searchTerm.toLowerCase();
        return foodDatabase.filter((f) => f.item.toLowerCase().includes(q)).slice(0, 20);
    }, [foodDatabase, searchTerm]);

    const sub = sumMacros(meal.items);

    return (
        <section className="nutrition-meal">
            <div className="nutrition-meal-head">
                <input
                    type="text"
                    className="nutrition-meal-title-input"
                    value={meal.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    aria-label="Meal title"
                />
                <button type="button" className="nutrition-remove-meal" onClick={onRemoveMeal}>
                    Remove meal
                </button>
            </div>

            {meal.items.length === 0 ? (
                <p className="nutrition-meal-empty">No foods in this meal yet.</p>
            ) : (
                <table className="nutrition-meal-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>kcal</th>
                            <th>P</th>
                            <th>C</th>
                            <th>F</th>
                            <th aria-label="Remove" />
                        </tr>
                    </thead>
                    <tbody>
                        {meal.items.map((f) => (
                            <tr key={f.id}>
                                <td>{f.item}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="nutrition-qty-input"
                                        value={f.quantity}
                                        onChange={(e) =>
                                            onUpdateFood(f.id, 'quantity', e.target.value)
                                        }
                                        aria-label="Quantity"
                                    />
                                </td>
                                <td>{f.calories}</td>
                                <td>{f.protein}</td>
                                <td>{f.carbs}</td>
                                <td>{f.fat}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="nutrition-remove-row"
                                        onClick={() => onRemoveFood(f.id)}
                                        aria-label="Remove food"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="nutrition-food-search">
                <label className="nutrition-search-label">Add food to this meal</label>
                <input
                    type="text"
                    className="nutrition-search-bar"
                    placeholder="Search food…"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <div className="nutrition-search-results">
                    {filteredFoods.map((food) => (
                        <div
                            key={food.id}
                            className="nutrition-food-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => onAddFood(food)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onAddFood(food);
                                }
                            }}
                        >
                            <div>
                                <div className="nutrition-food-name">{food.item}</div>
                                <div className="nutrition-food-meta">
                                    {food.calories} kcal · P {food.protein}g
                                </div>
                            </div>
                            <button type="button" className="nutrition-add-food-btn" title="Add">
                                +
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="nutrition-meal-subtotal">
                Meal subtotal: {Math.round(sub.calories)} kcal · P {sub.protein.toFixed(1)} · C{' '}
                {sub.carbs.toFixed(1)} · F {sub.fat.toFixed(1)}
            </div>
        </section>
    );
}
