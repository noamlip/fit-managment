import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TraineesModule } from './trainees/trainees.module';

@Module({
  imports: [CoreModule, ExercisesModule, TraineesModule],
})
export class AppModule {}
