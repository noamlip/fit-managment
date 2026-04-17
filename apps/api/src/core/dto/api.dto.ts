/**
 * API DTOs — keep in sync with apps/web `Exercise`, `ExerciseCatalog`, and trainee JSON shape.
 */

export interface ExerciseDto {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe?: number;
  notes?: string;
  rest?: number;
  bodyPart?: string;
}

export type ExerciseCatalog = Record<string, string[]>;

export interface SaveTraineeRoutinesBody {
  traineeId: string;
  routines: Record<string, ExerciseDto[]>;
}

/** Minimal trainee row shape in trainees.json for routine updates */
export interface TraineeRecord {
  id: string;
  name: string;
  routines?: Record<string, ExerciseDto[]>;
  [key: string]: unknown;
}
