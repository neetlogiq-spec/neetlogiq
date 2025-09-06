// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoTOrLIfgMkfr3lMQQJd3f_ZWqfi-bFjk",
  authDomain: "neetlogiq-15499.firebaseapp.com",
  projectId: "neetlogiq-15499",
  storageBucket: "neetlogiq-15499.firebasestorage.app",
  messagingSenderId: "100369453309",
  appId: "1:100369453309:web:205c0f116b5d899580ee94",
  measurementId: "G-V4V48LV46K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth helper functions
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const signOutUser = () => {
  return signOut(auth);
};

export { onAuthStateChanged };

export default app;
