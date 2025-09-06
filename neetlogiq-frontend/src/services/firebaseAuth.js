import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChanged 
} from '../config/firebase';

class FirebaseAuthService {
  constructor() {
    this.user = null;
    this.listeners = [];
    this.isInitialized = false;
    
    // Initialize auth state listener
    this.init();
  }

  // Initialize Firebase auth state listener
  init() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.isInitialized = true;
      
      // Notify all listeners about auth state change
      this.listeners.forEach(listener => {
        try {
          listener(user);
        } catch (error) {
          console.error('Auth listener error:', error);
        }
      });
      
      console.log('🔥 Firebase Auth State Changed:', user ? 'Signed In' : 'Signed Out');
    });
  }

  // Add auth state listener
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // If already initialized, call immediately
    if (this.isInitialized) {
      callback(this.user);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      console.log('🔥 Signing in with Google...');
      const result = await signInWithGoogle();
      const user = result.user;
      
      console.log('✅ Google sign-in successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('❌ Google sign-in failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      console.log('🔥 Signing out...');
      await signOutUser();
      console.log('✅ Sign-out successful');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Sign-out failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check if user is signed in
  isSignedIn() {
    return !!this.user;
  }

  // Get user info
  getUserInfo() {
    if (!this.user) return null;
    
    return {
      uid: this.user.uid,
      email: this.user.email,
      displayName: this.user.displayName,
      photoURL: this.user.photoURL,
      emailVerified: this.user.emailVerified
    };
  }

  // Get user display name or email
  getDisplayName() {
    if (!this.user) return 'Guest';
    return this.user.displayName || this.user.email || 'User';
  }

  // Get user photo URL
  getPhotoURL() {
    if (!this.user) return null;
    return this.user.photoURL;
  }

  // Check if auth is initialized
  isAuthInitialized() {
    return this.isInitialized;
  }

  // Get error message from Firebase error
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Wait for auth initialization
  async waitForAuth() {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(this.user);
      } else {
        const unsubscribe = this.onAuthStateChange((user) => {
          unsubscribe();
          resolve(user);
        });
      }
    });
  }
}

// Create singleton instance
const firebaseAuthService = new FirebaseAuthService();

export default firebaseAuthService;
