import { Body, Controller, Get, Post } from '@nestjs/common';
import type { ExerciseCatalog } from '../core/dto/api.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  async getExercises(): Promise<ExerciseCatalog> {
    return this.exercisesService.getCatalog();
  }

  @Post()
  async postExercises(@Body() body: ExerciseCatalog): Promise<{ success: true }> {
    await this.exercisesService.saveCatalog(body);
    return { success: true };
  }
}
