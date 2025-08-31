// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// Get these from: https://console.firebase.google.com/ > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Add App Check imports
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export const firebaseConfig = {
  apiKey: "AIzaSyBRV4b8uqVBf3h61J0Fmkgv_ESGnr9MpmA",
  authDomain: "expense-analyse-ee81d.firebaseapp.com",
  projectId: "expense-analyse-ee81d",
  storageBucket: "expense-analyse-ee81d.firebasestorage.app",
  messagingSenderId: "572352215877",
  appId: "1:572352215877:web:53ab4a8a8ad53b6e101c2c",
  measurementId: "G-WZ6PTVWLEP"
};

const app = initializeApp(firebaseConfig);
// Initialize App Check only in production (not localhost)
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LfbEHErAAAAAD2Bb23PpvduKyI7d6x5nsfmghz2'),
    isTokenAutoRefreshEnabled: true
  });
}
export const db = getFirestore(app);
export const auth = getAuth(app);

// Network status monitoring
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  console.log('Network connection restored');
  // Try to reconnect to Firestore
  enableNetwork(db).catch(console.error);
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('Network connection lost');
  // Disable network to use cache
  disableNetwork(db).catch(console.error);
});

// Export network status
export const getNetworkStatus = () => isOnline;

