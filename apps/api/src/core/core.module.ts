import { Global, Module } from '@nestjs/common';
import { EnvService } from './env/env.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { LocalDataPathService } from './persistence/local-data-path.service';
import { WorkoutPersistenceService } from './persistence/workout-persistence.service';

@Global()
@Module({
  providers: [EnvService, FirebaseAdminService, LocalDataPathService, WorkoutPersistenceService],
  exports: [EnvService, FirebaseAdminService, WorkoutPersistenceService],
})
export class CoreModule {}
