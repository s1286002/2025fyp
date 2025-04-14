"use server";
import admin from "firebase-admin";

// Check if the app has been initialized
function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY,
        projectId: process.env.NEXT_FIREBASE_PROJECT_ID,
      }),
      databaseURL: process.env.NEXT_FIREBASE_DATABASE_URL,
    });
  }

  return admin;
}

const firebaseAdmin = getFirebaseAdmin();

export { firebaseAdmin };
