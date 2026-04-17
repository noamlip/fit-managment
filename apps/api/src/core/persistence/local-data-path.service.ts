import path from 'path';
import { Injectable } from '@nestjs/common';

/**
 * Resolves `apps/web/public/data`.
 * - Compiled: `__dirname` is under `apps/api/lib/src/...` → five `..` to `apps/`.
 * - `tsx` from source: under `apps/api/src/...` → four `..` to `apps/`.
 */
@Injectable()
export class LocalDataPathService {
  workspacePublicDataDir(): string {
    const upToApps = path.normalize(__dirname).includes(`${path.sep}lib${path.sep}`)
      ? ['..', '..', '..', '..', '..']
      : ['..', '..', '..', '..'];
    return path.join(__dirname, ...upToApps, 'web', 'public', 'data');
  }
}
