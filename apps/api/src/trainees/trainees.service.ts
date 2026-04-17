import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { SaveTraineeRoutinesBody } from '../core/dto/api.dto';
import { WorkoutPersistenceService } from '../core/persistence/workout-persistence.service';

@Injectable()
export class TraineesService {
  constructor(private readonly persistence: WorkoutPersistenceService) {}

  async updateRoutines(body: SaveTraineeRoutinesBody): Promise<void> {
    try {
      const result = await this.persistence.updateTraineeRoutines(body);
      if (result === 'not_found') {
        throw new HttpException({ error: 'Trainee not found' }, HttpStatus.NOT_FOUND);
      }
      console.log(`Updated routines for trainee ${body.traineeId}`);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error('Error saving trainee routines:', err);
      throw new HttpException({ error: 'Failed to save trainee routines' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
