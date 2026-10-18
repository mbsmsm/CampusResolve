import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured via environment variables
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  !firebaseConfig.apiKey.includes('your_')
);

// Initialize Firebase only if config is present or dummy app to avoid crashing
const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(
      isFirebaseConfigured 
        ? firebaseConfig 
        : {
            apiKey: 'dummy-api-key-for-preview',
            authDomain: 'preview.firebaseapp.com',
            projectId: 'preview-project',
            storageBucket: 'preview.appspot.com',
            messagingSenderId: '000000000000',
            appId: '1:000000000000:web:0000000000000000',
          }
    );

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
