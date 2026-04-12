export interface FoodItem {
    id: string;
    item: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    // Index signature to allow for additional macro columns without code changes (Open/Closed Principle)
    [key: string]: string | number;
}

export interface NutritionPlan {
    dailyPlan: FoodItem[];
    mealTitles?: Record<number, string>;
}

export interface AppConfig {
    trainerName: string;
    programName: string;
    nutrition: NutritionPlan;
    foodDatabase?: FoodItem[];
}

// --- Trainee Management System Types ---

export interface TraineeMetrics {
    age: number;
    height: number; // cm
    weight: number; // kg
    gender: 'male' | 'female';
    activityLevel: 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
}

export interface TraineeCalculated {
    bmi: number;
    bmr: number;
    tdee: number;
}

export interface TraineeGoals {
    targetWeight: number;
    dailyCalories: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
    waterTarget?: number; // target in ml
}

export type PaymentMethodType = 'card' | 'bank_transfer' | 'cash';

export interface TraineePayment {
    method: PaymentMethodType;
    /** Display only, e.g. "Visa •••• 4242" */
    cardDisplay?: string;
    nextPaymentDate: string; // ISO date YYYY-MM-DD
    installmentsTotal: number;
    installmentsRemaining: number;
    /** Months left in the payment plan commitment */
    commitmentMonthsRemaining: number;
}

/** Values per feedback question id (file upload held in-memory until persisted) */
export type FeedbackAnswerValue = string | number | boolean | File;

export type FeedbackAnswers = Record<string, FeedbackAnswerValue>;

/** Extra rest requested during a guided session (logged for the coach). */
export interface RestExtensionEvent {
    /** Seconds since session start when the trainee added rest */
    atElapsedSeconds: number;
    addedSeconds: number;
}

export interface LoggedSet {
    setIndex: number;
    weightKg?: number;
    repsCompleted?: string;
}

export interface LoggedExercise {
    exerciseId: string;
    name: string;
    plannedSets: number;
    sets: LoggedSet[];
}

/** Saved on `DailyWorkout` after a guided session; optional `endedAt` while in progress. */
export interface WorkoutSessionLog {
    startedAt: string;
    endedAt?: string;
    totalElapsedSeconds?: number;
    exercises: LoggedExercise[];
    restExtensions?: RestExtensionEvent[];
    /** In-progress UI state for resume after refresh */
    draftCursor?: WorkoutSessionDraftCursor;
}

export interface WorkoutSessionDraftCursor {
    exerciseIndex: number;
    /** 1-based next set to perform (or current target in work phase) */
    setIndex: number;
    phase: 'work' | 'rest';
    restEndsAt?: string;
}

export interface DailyWorkout {
    workoutType: WorkoutType;
    status: 'pending' | 'completed' | 'skipped';
    feedback?: Record<string, FeedbackAnswerValue>;
    exercises?: Exercise[];
    /** Guided session: weights, rest extensions, timers */
    sessionLog?: WorkoutSessionLog;
}

export interface Trainee {
    id: string;
    name: string;
    email?: string;
    image?: string;
    startDate: string;
    metrics: TraineeMetrics;
    calculated?: TraineeCalculated;
    goals: TraineeGoals;
    lastWorkoutDate?: string;
    waterIntake?: number;
    schedule?: Record<string, DailyWorkout>; // Key is "YYYY-MM-DD"
    routines?: Record<string, Exercise[]>; // Persistent routines (e.g., routines['push'])
    weightHistory?: WeightRecord[];
    weeklyFeedback?: WeeklyFeedbackRecord[];
    payment?: TraineePayment;
    /** Coach last acknowledged workout feedback (ISO timestamp) */
    coachLastSeenWorkoutFeedbackAt?: string;
}

export type DigestionStatus = 'good' | 'ok' | 'poor';

export interface WeeklyFeedbackRecord {
    date: string; // ISO Date "YYYY-MM-DD"
    metabolism: number; // 1-10 scale
    hungerLevel: number; // 1-10 scale
    injured: boolean;
    injuryDetails?: string;
    generalFeeling: number; // 1-10 scale
    sleepAverage: number; // hours per night
    /** Subjective sleep quality 1–10 */
    sleepQuality1to10?: number;
    /** How full/satisfied 1–10 (complements hunger) */
    satietyLevel1to10?: number;
    digestion?: DigestionStatus;
    workoutDuration: number; // minutes
    workoutProgression: 'progressing' | 'stuck' | 'decreased';
    photos?: string[]; // URLs or base64 strings (legacy)
    photoFrontUrl?: string;
    photoBarUrl?: string;
    photoSideUrl?: string;
    coachReviewed?: boolean;
}

export interface WeightRecord {
    date: string; // ISO Date "YYYY-MM-DD"
    weight: number;
}

// --- PPL Workout Types ---

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string; // e.g., "8-12"
    rpe?: number;
    notes?: string;
    rest?: number; // seconds
    bodyPart?: string;
}

export type WorkoutType = 'push' | 'pull' | 'legs' | 'rest' | 'cardio' | 'hiit' | 'other';

export interface WorkoutSession {
    id: string;
    name: string; // e.g., "Push A"
    type: WorkoutType;
    exercises: Exercise[];
}

export interface WeeklySchedule {
    id: string; // usually matches traineeId
    traineeId: string;
    weekStart: string; // ISO Date
    days: {
        monday: WorkoutSession | null;
        tuesday: WorkoutSession | null;
        wednesday: WorkoutSession | null;
        thursday: WorkoutSession | null;
        friday: WorkoutSession | null;
        saturday: WorkoutSession | null;
        sunday: WorkoutSession | null;
    };
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    type: WorkoutType;
    exercises: Exercise[];
}

export type WorkoutDayStatus = 'completed' | 'pending' | 'rest';

export interface DailySchedule {
    date: string;
    workoutName: string;
    status: WorkoutDayStatus;
}

export type UserRole = 'coach' | 'trainer';

export interface UserSession {
    name: string;
    role: UserRole;
}

// --- Feedback System ---

export type FeedbackQuestionType = 'scale' | 'emoji_scale' | 'text' | 'number' | 'image';

export interface FeedbackQuestionConfig {
    min?: number;
    max?: number;
    labels?: Record<string, string>;
    placeholder?: string;
}

export interface FeedbackQuestion {
    id: string;
    text: string;
    type: FeedbackQuestionType;
    required?: boolean;
    config?: FeedbackQuestionConfig;
}

/** Body-part keyed exercise names from `public/data/exercises.json` */
export type ExerciseCatalog = Record<string, string[]>;

export interface WorkoutFeedbackFile {
    questions: FeedbackQuestion[];
}

// --- API response shapes (backend) ---

export interface ApiSuccessResponse {
    success: true;
}

export interface ApiErrorResponse {
    error: string;
}

export interface SaveTraineeRoutinesRequestBody {
    traineeId: string;
    routines: Record<string, Exercise[]>;
}
