import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private firestore: admin.firestore.Firestore | null = null;

  getFirestore(): admin.firestore.Firestore {
    if (!this.firestore) {
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      this.firestore = admin.firestore();
    }
    return this.firestore;
  }
}
