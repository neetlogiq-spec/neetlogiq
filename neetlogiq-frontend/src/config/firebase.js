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

// Set custom OAuth redirect URL to use custom domain
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Add localhost to authorized domains for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // This is a workaround for development - the proper fix is to add localhost to Firebase console
  console.warn('Firebase: Make sure to add localhost to authorized domains in Firebase Console');
}

// Auth helper functions
export const signInWithGoogle = () => {
  console.log('🔥 Attempting Google sign-in...');
  console.log('🔥 Auth domain:', auth.config.authDomain);
  console.log('🔥 Current domain:', window.location.hostname);
  
  return signInWithPopup(auth, googleProvider)
    .then((result) => {
      console.log('✅ Google sign-in successful:', result);
      return result;
    })
    .catch((error) => {
      console.error('❌ Google sign-in failed:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      throw error;
    });
};

export const signOutUser = () => {
  return signOut(auth);
};

export { onAuthStateChanged };

export default app;
