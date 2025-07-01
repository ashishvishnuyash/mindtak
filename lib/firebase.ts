// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI_XbMJgTUbehDoxhMQIOdD6joiBjLqFU",
  authDomain: "mindtest-94298.firebaseapp.com",
  projectId: "mindtest-94298",
  storageBucket: "mindtest-94298.firebasestorage.app",
  messagingSenderId: "620046306833",
  appId: "1:620046306833:web:aea27de390e3c9ebf32bb0",
  measurementId: "G-1ZLD1GX15N"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser and when supported)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines if you want to use Firebase emulators in development
  // Check if we're already connected to avoid multiple connections
  
  // if (!auth.config.emulator) {
  //   try {
  //     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  //   } catch (error) {
  //     console.log('Auth emulator connection failed (may already be connected)');
  //   }
  // }

  // // @ts-ignore - _delegate is internal but needed for emulator check
  // if (!db._delegate._databaseId.projectId.includes('demo-')) {
  //   try {
  //     connectFirestoreEmulator(db, 'localhost', 8080);
  //   } catch (error) {
  //     console.log('Firestore emulator connection failed (may already be connected)');
  //   }
  // }
}

export default app;