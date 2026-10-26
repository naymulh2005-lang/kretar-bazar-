import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

// Initialize Authentication
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Initialize Firestore with custom Database ID and auto-detect long polling
const firestoreDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  }, firestoreDbId);
} catch {
  firestoreInstance = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);
}

export const db = firestoreInstance;

// Initialize Firebase Storage
export const storage = getStorage(app);

// Collection Names Constants
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  MEDIA: 'media',
  HERO_SLIDES: 'hero_slides',
  HEADER_CONFIGS: 'header_configs',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications'
} as const;
