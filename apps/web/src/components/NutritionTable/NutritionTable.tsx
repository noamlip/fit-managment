import { useEffect, useMemo, useState, type FC } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useNutritionPlanCommit } from '../../context/NutritionPlanCommitContext';
import { useTrainee } from '../../context/TraineeContext';
import type { FoodItem, Meal, NutritionPlan } from '../../types';
import {
    cloneMeals,
    ensureMeals,
    getDayTypeForDate,
    getMealsForPlanDate,
    NUTRITION_SHOPPING_DATE_KEY,
    type DayType,
} from '../../lib/nutritionDayMeals';
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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function dateWindow(start: Date, totalDays: number): string[] {
    return Array.from({ length: totalDays }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return toIsoDate(day);
    });
}

function formatDayCaption(isoDate: string, todayIso: string): string {
    if (isoDate === todayIso) return 'Today';
    const day = new Date(`${isoDate}T00:00:00`);
    const dayName = DAY_LABELS[day.getDay()] ?? '';
    const shortDate = day.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
    return `${dayName} ${shortDate}`;
}

interface NutritionTableProps {
    /** Hide the panel H2 when a parent route already shows a section title (e.g. coach chrome). */
    hidePanelTitle?: boolean;
    /** Coach flows: route chrome, menu overlay — tighter layout + scroll affordances on small screens. */
    variant?: 'default' | 'coach';
    /**
     * Trainee view: no editing meals, quantities, or structure.
     * If omitted, defaults to `userRole === 'trainer'`.
     */
    readOnly?: boolean;
    /** Trainee: open shopping list (parent handles navigation / overlay). */
    onOpenShoppingList?: () => void;
}

export const NutritionTable: FC<NutritionTableProps> = ({
    hidePanelTitle = false,
    variant = 'default',
    readOnly: readOnlyProp,
    onOpenShoppingList,
}) => {
    const coachPanel = variant === 'coach' ? ' nutrition-panel--coach' : '';
    const coachWrap = variant === 'coach' ? ' nutrition-table-wrap--coach' : '';
    const { foodDatabase, currentPlan, userRole, trainerName, selectedTrainee } = useConfig();
    const { trainees } = useTrainee();
    const { commitPlan } = useNutritionPlanCommit();
    const [searchByMeal, setSearchByMeal] = useState<Record<string, string>>({});
    const [selectedDate, setSelectedDate] = useState<string>(() => toIsoDate(new Date()));
    const [draftMeals, setDraftMeals] = useState<Meal[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const effectiveReadOnly = readOnlyProp ?? userRole === 'trainer';

    const todayIso = toIsoDate(new Date());
    const visibleDates = useMemo(() => dateWindow(new Date(), 7), []);
    const activeTraineeName = userRole === 'coach' ? selectedTrainee : trainerName;
    const activeTrainee = useMemo(
        () => trainees.find((trainee) => trainee.name === activeTraineeName),
        [trainees, activeTraineeName]
    );

    const selectedDayType: DayType = useMemo(
        () => (currentPlan ? getDayTypeForDate(currentPlan, activeTrainee, selectedDate) : 'training'),
        [currentPlan, activeTrainee, selectedDate]
    );

    const meals = useMemo(
        () =>
            currentPlan
                ? getMealsForPlanDate(currentPlan, selectedDate, selectedDayType)
                : ensureMeals(undefined),
        [currentPlan, selectedDate, selectedDayType]
    );

    const displayedMeals = effectiveReadOnly
        ? meals
        : draftMeals.length > 0
          ? draftMeals
          : meals;

    const dayTotals = useMemo(() => {
        const all = displayedMeals.flatMap((m) => m.items);
        return sumMacros(all);
    }, [displayedMeals]);

    const setPlan = (next: NutritionPlan) => {
        commitPlan(next);
    };

    const patchMealsForSelectedDayType = (plan: NutritionPlan, nextMeals: Meal[]): NutritionPlan => {
        return {
            ...plan,
            meals: selectedDayType === 'training' ? nextMeals : plan.meals,
            trainingDayMeals: ensureMeals(plan.trainingDayMeals ?? plan.meals),
            restDayMeals: ensureMeals(plan.restDayMeals ?? plan.meals),
            dayTypes: plan.dayTypes ?? {},
            dayMeals: {
                ...(plan.dayMeals ?? {}),
                [selectedDate]: nextMeals,
            },
        };
    };

    useEffect(() => {
        if (effectiveReadOnly) {
            setDraftMeals([]);
            setHasUnsavedChanges(false);
            return;
        }
        setDraftMeals(cloneMeals(meals));
        setHasUnsavedChanges(false);
    }, [selectedDate, selectedDayType, currentPlan, meals, effectiveReadOnly]);

    const setSelectedDayType = (dayType: DayType) => {
        if (effectiveReadOnly || !currentPlan) return;
        const sourceMeals =
            dayType === 'rest'
                ? ensureMeals(currentPlan.restDayMeals ?? currentPlan.meals)
                : ensureMeals(currentPlan.trainingDayMeals ?? currentPlan.meals);
        setPlan({
            ...currentPlan,
            trainingDayMeals: ensureMeals(currentPlan.trainingDayMeals ?? currentPlan.meals),
            restDayMeals: ensureMeals(currentPlan.restDayMeals ?? currentPlan.meals),
            dayTypes: {
                ...(currentPlan.dayTypes ?? {}),
                [selectedDate]: dayType,
            },
            dayMeals: {
                ...(currentPlan.dayMeals ?? {}),
                [selectedDate]: cloneMeals(sourceMeals),
            },
        });
        setDraftMeals(cloneMeals(sourceMeals));
        setHasUnsavedChanges(true);
    };

    const updateMealTitle = (mealId: string, title: string) => {
        if (effectiveReadOnly) return;
        const nextMeals = displayedMeals.map((m) => (m.id === mealId ? { ...m, title } : m));
        setDraftMeals(nextMeals);
        setHasUnsavedChanges(true);
    };

    const removeMeal = (mealId: string) => {
        if (effectiveReadOnly || !currentPlan) return;
        const meal = displayedMeals.find((m) => m.id === mealId);
        if (!meal) return;
        if (meal.items.length > 0 && !confirm('Remove this meal and all its foods?')) return;
        const nextMeals = displayedMeals.filter((m) => m.id !== mealId);
        const normalizedNextMeals =
            nextMeals.length > 0 ? nextMeals : [{ id: newMealId(), title: 'Meal 1', items: [] }];
        setDraftMeals(normalizedNextMeals);
        setHasUnsavedChanges(true);
    };

    const addMeal = () => {
        if (effectiveReadOnly) return;
        const n = displayedMeals.length + 1;
        const nextMeals = [...displayedMeals, { id: newMealId(), title: `Meal ${n}`, items: [] }];
        setDraftMeals(nextMeals);
        setHasUnsavedChanges(true);
    };

    const removeFood = (mealId: string, foodId: string) => {
        if (effectiveReadOnly) return;
        const nextMeals = displayedMeals.map((m) =>
            m.id === mealId ? { ...m, items: m.items.filter((f) => f.id !== foodId) } : m
        );
        setDraftMeals(nextMeals);
        setHasUnsavedChanges(true);
    };

    const updateFoodField = (
        mealId: string,
        foodId: string,
        field: keyof FoodItem,
        value: string | number
    ) => {
        if (effectiveReadOnly) return;
        const nextMeals = displayedMeals.map((m) => {
            if (m.id !== mealId) return m;
            return {
                ...m,
                items: m.items.map((f) => {
                    if (f.id !== foodId) return f;
                    const next = { ...f, [field]: value } as FoodItem;
                    return next;
                }),
            };
        });
        setDraftMeals(nextMeals);
        setHasUnsavedChanges(true);
    };

    const addFoodToMeal = (mealId: string, food: FoodItem) => {
        if (effectiveReadOnly) return;
        const newItem: FoodItem = {
            ...food,
            id: newFoodId(),
        };
        const nextMeals = displayedMeals.map((m) =>
            m.id === mealId ? { ...m, items: [...m.items, newItem] } : m
        );
        setDraftMeals(nextMeals);
        setHasUnsavedChanges(true);
        setSearchByMeal((prev) => ({ ...prev, [mealId]: '' }));
    };

    const saveSelectedDayMeals = () => {
        if (effectiveReadOnly || !currentPlan) return;
        setPlan(patchMealsForSelectedDayType(currentPlan, cloneMeals(displayedMeals)));
        setHasUnsavedChanges(false);
    };

    const openShopping = () => {
        try {
            sessionStorage.setItem(NUTRITION_SHOPPING_DATE_KEY, selectedDate);
        } catch {
            /* ignore */
        }
        onOpenShoppingList?.();
    };

    if (!currentPlan) {
        return (
            <div className={`nutrition-table-wrap${coachWrap}`}>
                <p style={{ color: '#888' }}>Loading nutrition plan…</p>
            </div>
        );
    }

    return (
        <div className={`nutrition-panel${coachPanel}`}>
            <div className="nutrition-panel-head">
                {effectiveReadOnly && onOpenShoppingList && (
                    <button
                        type="button"
                        className="nutrition-cart-btn"
                        onClick={openShopping}
                        aria-label="Open shopping list"
                        title="Shopping list"
                    >
                        <ShoppingCart size={22} strokeWidth={2} />
                    </button>
                )}
                {!hidePanelTitle && <h2 className="nutrition-panel-title">Daily nutrition</h2>}
            </div>

            <section className="nutrition-day-selector">
                <div className="nutrition-date-chips" role="tablist" aria-label="Select nutrition day">
                    {visibleDates.map((isoDate) => (
                        <button
                            key={isoDate}
                            type="button"
                            className={`nutrition-date-chip${selectedDate === isoDate ? ' is-active' : ''}`}
                            onClick={() => setSelectedDate(isoDate)}
                        >
                            {formatDayCaption(isoDate, todayIso)}
                        </button>
                    ))}
                </div>

                {!effectiveReadOnly && (
                    <div className="nutrition-day-type-toggle" role="radiogroup" aria-label="Day type">
                        <button
                            type="button"
                            className={selectedDayType === 'training' ? 'is-active' : ''}
                            onClick={() => setSelectedDayType('training')}
                        >
                            Training day
                        </button>
                        <button
                            type="button"
                            className={selectedDayType === 'rest' ? 'is-active' : ''}
                            onClick={() => setSelectedDayType('rest')}
                        >
                            Rest day
                        </button>
                    </div>
                )}
            </section>

            <p className="nutrition-day-context">
                Menu for <strong>{formatDayCaption(selectedDate, todayIso)}</strong> is based on{' '}
                <strong>{selectedDayType === 'training' ? 'Training day' : 'Rest day'}</strong>.
            </p>

            {!effectiveReadOnly && (
                <div className="nutrition-day-actions">
                    <button
                        type="button"
                        className="nutrition-save-day-btn"
                        onClick={saveSelectedDayMeals}
                        disabled={!hasUnsavedChanges}
                    >
                        Save menu for this day
                    </button>
                    <span className="nutrition-save-day-state">
                        {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
                    </span>
                </div>
            )}

            {displayedMeals.map((meal) => (
                <MealBlock
                    key={meal.id}
                    meal={meal}
                    readOnly={effectiveReadOnly}
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

            {!effectiveReadOnly && (
                <button type="button" className="nutrition-add-meal" onClick={addMeal}>
                    Add meal
                </button>
            )}

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
    readOnly: boolean;
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
    readOnly,
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
                {readOnly ? (
                    <h3 className="nutrition-meal-title-static">{meal.title}</h3>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {meal.items.length === 0 ? (
                <p className="nutrition-meal-empty">No foods in this meal yet.</p>
            ) : (
                <div className="nutrition-meal-table-scroll">
                    <table className={`nutrition-meal-table${readOnly ? ' nutrition-meal-table--readonly' : ''}`}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Energy & macros</th>
                                {!readOnly && <th aria-label="Remove" />}
                            </tr>
                        </thead>
                        <tbody>
                            {meal.items.map((f) => (
                                <tr key={f.id}>
                                    <td className="nutrition-item-cell">{f.item}</td>
                                    <td className="nutrition-qty-cell">
                                        {readOnly ? (
                                            <span className="nutrition-qty-readonly">{f.quantity}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                className="nutrition-qty-input"
                                                value={f.quantity}
                                                onChange={(e) =>
                                                    onUpdateFood(f.id, 'quantity', e.target.value)
                                                }
                                                aria-label="Quantity"
                                            />
                                        )}
                                    </td>
                                    <td className="nutrition-macro-inline">
                                        {Math.round(Number(f.calories) || 0)} kcal · P{' '}
                                        {Number(f.protein).toFixed(1)} · C {Number(f.carbs).toFixed(1)} · F{' '}
                                        {Number(f.fat).toFixed(1)}
                                    </td>
                                    {!readOnly && (
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
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!readOnly && (
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
            )}

            <div className="nutrition-meal-subtotal nutrition-meal-subtotal--inline">
                Meal subtotal: {Math.round(sub.calories)} kcal · P {sub.protein.toFixed(1)} · C{' '}
                {sub.carbs.toFixed(1)} · F {sub.fat.toFixed(1)}
            </div>
        </section>
    );
}
