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

export interface DailyWorkout {
    workoutType: WorkoutType;
    status: 'pending' | 'completed' | 'skipped';
    feedback?: Record<string, any>;
    exercises?: Exercise[];
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
}

export interface WeeklyFeedbackRecord {
    date: string; // ISO Date "YYYY-MM-DD"
    metabolism: number; // 1-10 scale
    hungerLevel: number; // 1-10 scale
    injured: boolean;
    injuryDetails?: string;
    generalFeeling: number; // 1-10 scale
    sleepAverage: number; // hours per night
    workoutDuration: number; // minutes
    workoutProgression: 'progressing' | 'stuck' | 'decreased';
    photos?: string[]; // URLs or base64 strings
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
