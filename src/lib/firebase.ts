
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Valid active Firebase config for knowmenow-c7baa
const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyBuZna--xSh24lwhJo5sMiQrfBDH0sRgzI',
  authDomain: 'knowmenow-c7baa.firebaseapp.com',
  projectId: 'knowmenow-c7baa',
  storageBucket: 'knowmenow-c7baa.firebasestorage.app',
  messagingSenderId: '748097146318',
  appId: '1:748097146318:web:278e0f8fc0f18bedebaf9f',
  measurementId: 'G-14H546PBZY',
};

// Guard against legacy dead project keys (e.g. from obsolete Vercel environment variables)
const isLegacyOrEmpty = (val?: string) =>
  !val ||
  val.trim() === '' ||
  val.includes('studio-8327262984') ||
  val === 'AIzaSyBH0zj-evZ173b8m502rZ51TQ-T_u48qPY' ||
  val.includes('883769836306');

const firebaseConfig = {
  apiKey: isLegacyOrEmpty(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    ? DEFAULT_CONFIG.apiKey
    : process.env.NEXT_PUBLIC_FIREBASE_API_KEY!.trim(),
  authDomain: isLegacyOrEmpty(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    ? DEFAULT_CONFIG.authDomain
    : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!.trim(),
  projectId: isLegacyOrEmpty(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    ? DEFAULT_CONFIG.projectId
    : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!.trim(),
  storageBucket: DEFAULT_CONFIG.storageBucket,
  messagingSenderId: DEFAULT_CONFIG.messagingSenderId,
  appId: isLegacyOrEmpty(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
    ? DEFAULT_CONFIG.appId
    : process.env.NEXT_PUBLIC_FIREBASE_APP_ID!.trim(),
  measurementId: DEFAULT_CONFIG.measurementId,
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
      /* analytics unavailable, safe to ignore */
    });
}

export { app, auth, db, analytics };
