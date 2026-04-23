import { useEffect, useState, type FC } from 'react';
import { LayoutDashboard, Utensils, Dumbbell, MessageSquare, X } from 'lucide-react';
import type { Trainee } from '../../types';
import { GoalsOverview } from './components/GoalsOverview';
import { WeeklyFeedback } from './components/WeeklyFeedback';
import { RoutineTemplatesEditor } from './components/RoutineTemplatesEditor';
import { NutritionTable } from '../../components/NutritionTable/NutritionTable';
import { NutritionShoppingPage } from '../NutritionShoppingPage/NutritionShoppingPage';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import './TraineeHubOverlay.scss';

type HubTab = 'overview' | 'nutrition' | 'templates' | 'feedback';

interface Props {
    open: boolean;
    onClose: () => void;
    activeTrainee: Trainee | undefined;
    trainerName: string | null;
    onGoToWorkouts: () => void;
    updateTrainee: (id: string, updates: Partial<Trainee>) => void;
    /** Coach: hide Workout templates tab (use Trainee Manager → Templates only). */
    variant?: 'athlete' | 'coach';
}

export const TraineeHubOverlay: FC<Props> = ({
    open,
    onClose,
    activeTrainee,
    trainerName,
    onGoToWorkouts,
    updateTrainee,
    variant = 'athlete',
}) => {
    const isCoach = variant === 'coach';
    const [tab, setTab] = useState<HubTab>('overview');
    const [nutritionSub, setNutritionSub] = useState<'plan' | 'shopping'>('plan');
    const [escapeSuspended, setEscapeSuspended] = useState(false);

    useEscapeToClose(onClose, open && !escapeSuspended);

    useEffect(() => {
        if (isCoach && tab === 'templates') setTab('overview');
    }, [isCoach, tab]);

    useEffect(() => {
        if (tab !== 'nutrition') setNutritionSub('plan');
    }, [tab]);

    if (!open) return null;

    const title = trainerName ? `${trainerName}'s dashboard` : 'My dashboard';

    return (
        <div
            className="trainee-hub-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={onClose}
        >
            <div className="trainee-hub-panel" onClick={(e) => e.stopPropagation()}>
                <header className="trainee-hub-head">
                    <h2 id="trainee-hub-title">{title}</h2>
                    <button type="button" className="trainee-hub-close" onClick={onClose} aria-label="Close">
                        <X size={22} />
                    </button>
                </header>

                <div className="trainee-hub-toolbar">
                    <nav className="trainee-hub-tabs" aria-labelledby="trainee-hub-title">
                        <button
                            type="button"
                            className={tab === 'overview' ? 'active' : ''}
                            onClick={() => setTab('overview')}
                        >
                            <LayoutDashboard size={18} /> Overview
                        </button>
                        <button
                            type="button"
                            className={tab === 'nutrition' ? 'active' : ''}
                            onClick={() => setTab('nutrition')}
                        >
                            <Utensils size={18} /> Nutrition
                        </button>
                        {!isCoach && (
                            <button
                                type="button"
                                className={tab === 'templates' ? 'active' : ''}
                                onClick={() => setTab('templates')}
                            >
                                <Dumbbell size={18} /> Workout templates
                            </button>
                        )}
                        <button
                            type="button"
                            className={tab === 'feedback' ? 'active' : ''}
                            onClick={() => setTab('feedback')}
                        >
                            <MessageSquare size={18} /> Feedback
                        </button>
                    </nav>
                    <button
                        type="button"
                        className="trainee-hub-goto-workouts"
                        onClick={() => {
                            onClose();
                            onGoToWorkouts();
                        }}
                    >
                        Go to Workouts
                    </button>
                </div>

                {isCoach && (
                    <p className="trainee-hub-coach-hint">
                        Workout templates: use <strong>Manage trainee → Templates</strong> tab.
                    </p>
                )}

                <div className="trainee-hub-body">
                    {tab === 'overview' && (
                        <div className="trainee-hub-scroll">
                            <GoalsOverview activeTrainee={activeTrainee} waterVariant="interactive" />
                        </div>
                    )}
                    {tab === 'nutrition' && (
                        <div className="trainee-hub-scroll">
                            {nutritionSub === 'shopping' ? (
                                <NutritionShoppingPage onBack={() => setNutritionSub('plan')} />
                            ) : (
                                <NutritionTable
                                    readOnly={!isCoach}
                                    onOpenShoppingList={
                                        !isCoach ? () => setNutritionSub('shopping') : undefined
                                    }
                                />
                            )}
                        </div>
                    )}
                    {tab === 'templates' && !isCoach && (
                        <div className="trainee-hub-scroll">
                            {activeTrainee ? (
                                <RoutineTemplatesEditor
                                    trainee={activeTrainee}
                                    updateTrainee={updateTrainee}
                                    onEscapeLockChange={setEscapeSuspended}
                                />
                            ) : (
                                <p className="trainee-hub-missing">No trainee profile found for this account.</p>
                            )}
                        </div>
                    )}
                    {tab === 'feedback' && (
                        <div className="trainee-hub-scroll">
                            <WeeklyFeedback trainee={activeTrainee} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
