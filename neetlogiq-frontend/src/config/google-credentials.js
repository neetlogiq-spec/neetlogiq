// Google OAuth Credentials
// This file contains the actual Google OAuth configuration from the provided credentials

export const GOOGLE_CREDENTIALS = {
  client_id: "1010076677532-0nqc9aqdev36oe5bvnfa39hdlv86rpp2.apps.googleusercontent.com",
  project_id: "neetlogiq",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  // client_secret: moved to backend for security - NEVER expose in frontend
  redirect_uris: [
    "https://neetlogiq-backend.neetlogiq.workers.dev/api/auth/google/callback", // Production backend
    "http://localhost:4000/api/auth/google/callback",
    "https://neetlogiq.com/api/auth/google/callback",
    "https://neetlogiq.pages.dev/api/auth/google/callback"
  ],
  javascript_origins: [
    "http://localhost:3000", // Frontend dev port
    "http://localhost:4001",
    "http://localhost:5001", // Your current dev port
    "https://neetlogiq.com",
    "https://neetlogiq.pages.dev"
  ]
};

// Note: The redirect_uris and javascript_origins are configured for our application which runs on:
// Frontend: http://localhost:3000
// Cloudflare Worker: https://neetlogiq-backend.neetlogiq.workers.dev
