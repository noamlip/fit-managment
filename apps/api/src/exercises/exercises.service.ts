import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { ExerciseCatalog } from '../core/dto/api.dto';
import { WorkoutPersistenceService } from '../core/persistence/workout-persistence.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly persistence: WorkoutPersistenceService) {}

  async getCatalog(): Promise<ExerciseCatalog> {
    try {
      return await this.persistence.getExerciseCatalog();
    } catch (err) {
      console.error('Error reading exercises:', err);
      throw new HttpException({ error: 'Failed to read exercises' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async saveCatalog(catalog: ExerciseCatalog): Promise<void> {
    try {
      await this.persistence.saveExerciseCatalog(catalog);
      console.log('Updated exercise catalog');
    } catch (err) {
      console.error('Error saving exercises:', err);
      throw new HttpException({ error: 'Failed to save exercises' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
