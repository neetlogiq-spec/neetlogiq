const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// --- START: ADD DEBUG LOGS ---
console.log('--- Passport Strategy Configuration ---');
console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'NOT LOADED');
console.log('------------------------------------');
// --- END: ADD DEBUG LOGS ---

// Basic user serialization (we'll enhance this later)
passport.serializeUser((user, done) => { 
  done(null, user.id || user.googleId || 'temp-user'); 
});

passport.deserializeUser(async (id, done) => {
  try {
    // For now, just return a basic user object
    // We'll enhance this when database is properly connected
    done(null, { id, googleId: id });
  } catch (err) { 
    done(err, null); 
  }
});

// Google OAuth Strategy - Temporarily disabled for testing
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: '/api/auth/google/callback',
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // For now, just return the profile
//       // We'll enhance this when database is properly connected
//       const user = {
//         id: profile.id,
//         googleId: profile.id,
//         displayName: profile.displayName,
//         email: profile.emails[0]?.value,
//         picture: profile.photos[0]?.value
//       };
//       done(null, user);
//     } catch (err) { 
//       done(err, null); 
//     }
//   }
// ));

console.log('User model initialized for Google OAuth.');
