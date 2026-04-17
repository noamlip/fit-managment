import fs from 'fs/promises';
import { Injectable } from '@nestjs/common';
import type {
  ExerciseCatalog,
  SaveTraineeRoutinesBody,
  TraineeRecord,
} from '../dto/api.dto';
import { EnvService } from '../env/env.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { LocalDataPathService } from './local-data-path.service';

/** Firestore: config/catalog doc, field `parts` = ExerciseCatalog */
const CONFIG_COLLECTION = 'config';
const CATALOG_DOC_ID = 'catalog';
const PARTS_FIELD = 'parts';

const TRAINEES_COLLECTION = 'trainees';

@Injectable()
export class WorkoutPersistenceService {
  constructor(
    private readonly env: EnvService,
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly localPaths: LocalDataPathService
  ) {}

  private async readJsonFile<T>(filename: string): Promise<T> {
    const filePath = `${this.localPaths.workspacePublicDataDir()}/${filename}`;
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err ? (err as NodeJS.ErrnoException).code : undefined;
      if (code === 'ENOENT') {
        return [] as unknown as T;
      }
      throw err;
    }
  }

  private async writeJsonFile(filename: string, data: unknown): Promise<void> {
    const filePath = `${this.localPaths.workspacePublicDataDir()}/${filename}`;
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
  }

  private catalogFromFirestoreData(data: Record<string, unknown> | undefined): ExerciseCatalog {
    if (!data || typeof data !== 'object') return {};
    const parts = data[PARTS_FIELD];
    if (!parts || typeof parts !== 'object') return {};
    return parts as ExerciseCatalog;
  }

  async getExerciseCatalog(): Promise<ExerciseCatalog> {
    if (this.env.useFirestore()) {
      const db = this.firebaseAdmin.getFirestore();
      const snap = await db.collection(CONFIG_COLLECTION).doc(CATALOG_DOC_ID).get();
      return this.catalogFromFirestoreData(snap.data() as Record<string, unknown> | undefined);
    }
    const raw = await this.readJsonFile<ExerciseCatalog | unknown>('exercises.json');
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as ExerciseCatalog;
    }
    return {};
  }

  async saveExerciseCatalog(catalog: ExerciseCatalog): Promise<void> {
    if (this.env.useFirestore()) {
      const db = this.firebaseAdmin.getFirestore();
      await db
        .collection(CONFIG_COLLECTION)
        .doc(CATALOG_DOC_ID)
        .set(
          {
            [PARTS_FIELD]: catalog,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      return;
    }
    await this.writeJsonFile('exercises.json', catalog);
  }

  async updateTraineeRoutines(body: SaveTraineeRoutinesBody): Promise<'ok' | 'not_found'> {
    const { traineeId, routines } = body;
    if (this.env.useFirestore()) {
      const db = this.firebaseAdmin.getFirestore();
      const ref = db.collection(TRAINEES_COLLECTION).doc(traineeId);
      const snap = await ref.get();
      if (!snap.exists) return 'not_found';
      await ref.set({ routines, updatedAt: new Date().toISOString() }, { merge: true });
      return 'ok';
    }
    const trainees = await this.readJsonFile<TraineeRecord[]>('trainees.json');
    if (!Array.isArray(trainees)) {
      return 'not_found';
    }
    const index = trainees.findIndex((t) => t.id === traineeId);
    if (index === -1) return 'not_found';
    trainees[index] = { ...trainees[index], routines };
    await this.writeJsonFile('trainees.json', trainees);
    return 'ok';
  }
}
