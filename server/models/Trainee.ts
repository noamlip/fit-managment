import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    rpe: { type: Number },
    notes: { type: String },
    rest: { type: Number },
    bodyPart: { type: String }
});

const DailyWorkoutSchema = new mongoose.Schema({
    workoutType: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'skipped'], required: true },
    feedback: { type: Map, of: mongoose.Schema.Types.Mixed },
    exercises: [ExerciseSchema]
});

const WeightRecordSchema = new mongoose.Schema({
    date: { type: String, required: true },
    weight: { type: Number, required: true }
});

const WeeklyFeedbackRecordSchema = new mongoose.Schema({
    date: { type: String, required: true },
    metabolism: { type: Number, required: true },
    hungerLevel: { type: Number, required: true },
    injured: { type: Boolean, required: true },
    injuryDetails: { type: String },
    generalFeeling: { type: Number, required: true },
    sleepAverage: { type: Number, required: true },
    workoutDuration: { type: Number, required: true },
    workoutProgression: { type: String, enum: ['progressing', 'stuck', 'decreased'], required: true },
    photos: [{ type: String }]
});

const TraineeSchema = new mongoose.Schema({
    // Link to the main trainer / AppConfig
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppConfig' },

    name: { type: String, required: true },
    email: { type: String },
    image: { type: String },
    startDate: { type: String, required: true, default: () => new Date().toISOString().split('T')[0] },

    metrics: {
        age: { type: Number, required: true },
        height: { type: Number, required: true },
        weight: { type: Number, required: true },
        gender: { type: String, enum: ['male', 'female'], required: true },
        activityLevel: { type: Number, required: true }
    },

    calculated: {
        bmi: { type: Number },
        bmr: { type: Number },
        tdee: { type: Number }
    },

    goals: {
        targetWeight: { type: Number, required: true },
        dailyCalories: { type: Number, required: true },
        proteinTarget: { type: Number },
        carbsTarget: { type: Number },
        fatTarget: { type: Number },
        waterTarget: { type: Number }
    },

    lastWorkoutDate: { type: String },
    waterIntake: { type: Number, default: 0 },

    schedule: {
        type: Map,
        of: DailyWorkoutSchema,
        default: {}
    },

    routines: {
        type: Map,
        of: [ExerciseSchema],
        default: {}
    },

    weightHistory: [WeightRecordSchema],
    weeklyFeedback: [WeeklyFeedbackRecordSchema]

}, { timestamps: true });

export const Trainee = mongoose.model('Trainee', TraineeSchema);
