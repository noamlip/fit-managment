import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import type { SaveTraineeRoutinesBody } from '../core/dto/api.dto';
import { TraineesService } from './trainees.service';

@Controller('trainees')
export class TraineesController {
  constructor(private readonly traineesService: TraineesService) {}

  @Post('routines')
  async saveRoutines(@Body() body: SaveTraineeRoutinesBody): Promise<{ success: true }> {
    if (!body?.traineeId || !body?.routines) {
      throw new BadRequestException({ error: 'Missing traineeId or routines' });
    }
    await this.traineesService.updateRoutines(body);
    return { success: true };
  }
}
