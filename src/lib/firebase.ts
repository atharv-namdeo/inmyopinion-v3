
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBH0zj-evZ173b8m502rZ51TQ-T_u48qPY',
  authDomain: 'studio-8327262984-8cd3b.firebaseapp.com',
  databaseURL: 'https://studio-8327262984-8cd3b-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'studio-8327262984-8cd3b',
  storageBucket: 'studio-8327262984-8cd3b.firebasestorage.app',
  messagingSenderId: '883769836306',
  appId: '1:883769836306:web:96ebbb1eb96c9ef15ce9cb',
  measurementId: 'G-Z58SVD0YG0',
};

// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in browser (not SSR)
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
