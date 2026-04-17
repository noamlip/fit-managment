import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvService {
  useFirestore(): boolean {
    if (process.env.USE_FIRESTORE === 'false') return false;
    if (process.env.USE_FIRESTORE === 'true') return true;
    return Boolean(process.env.K_SERVICE || process.env.FUNCTION_NAME || process.env.FUNCTION_TARGET);
  }
}
