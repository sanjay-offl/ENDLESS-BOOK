import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "endless-ebook.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "endless-ebook",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "endless-ebook.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "524097848411",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:524097848411:web:f73674e7255ccfef2aab7e",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
