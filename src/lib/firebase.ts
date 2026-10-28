
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Config can be overridden via NEXT_PUBLIC_* env vars; falls back to the
// project defaults below.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyBuZna--xSh24lwhJo5sMiQrfBDH0sRgzI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'knowmenow-c7baa.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'knowmenow-c7baa',
  storageBucket: 'knowmenow-c7baa.firebasestorage.app',
  messagingSenderId: '748097146318',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:748097146318:web:278e0f8fc0f18bedebaf9f',
  measurementId: 'G-14H546PBZY',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is optional and only enabled when the environment supports it AND
// a valid measurement key is configured. Wrapped so a blocked/invalid key can
// never surface an unhandled console error.
let analytics: Analytics | undefined = undefined;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
  isSupported()
    .then((ok) => {
      if (ok) analytics = getAnalytics(app);
    })
    .catch(() => {
      /* analytics unavailable — safe to ignore */
    });
}

export { app, auth, db, analytics };
