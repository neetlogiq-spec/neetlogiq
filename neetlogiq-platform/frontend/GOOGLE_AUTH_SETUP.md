# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the NeetLogIQ application.

## Prerequisites

- Google account
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `NeetLogIQ` (or any name you prefer)
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and then "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `NeetLogIQ`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
   - Add test users (your email for testing)

4. Back to creating OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: `NeetLogIQ Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:5001` (for development)
     - `http://localhost:3000` (if using different port)
     - Your production domain (when deploying)
   - Authorized redirect URIs:
     - `http://localhost:5001` (for development)
     - Your production domain (when deploying)

5. Click "Create"
6. Copy the **Client ID** (not the Client Secret)

## Step 4: Configure the Application

1. Create a `.env.local` file in the `neetlogiq-frontend` directory:
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5002
```

2. Replace `your-client-id-here.apps.googleusercontent.com` with your actual Client ID from Step 3.

## Step 5: Test the Integration

1. Start the frontend: `npm start`
2. Start the backend: `node completeServer.js`
3. Navigate to `http://localhost:5001/courses`
4. Click "Sign in with Google"
5. Complete the OAuth flow
6. Verify that the user popup appears with your information

## Troubleshooting

### Common Issues:

1. **"This app isn't verified" warning:**
   - This is normal for development
   - Click "Advanced" → "Go to NeetLogIQ (unsafe)" to proceed

2. **"Error 400: redirect_uri_mismatch":**
   - Check that your redirect URI in Google Console matches your app URL
   - Make sure there are no trailing slashes

3. **"Error 403: access_denied":**
   - Check that your domain is added to authorized origins
   - Verify the OAuth consent screen is configured

4. **Client ID not working:**
   - Make sure you copied the Client ID (not Client Secret)
   - Verify the `.env.local` file is in the correct location
   - Restart the development server after adding environment variables

## Security Notes

- Never commit the `.env.local` file to version control
- The Client ID is safe to expose in frontend code
- For production, use proper domain names in authorized origins
- Consider implementing backend token verification for enhanced security

## Production Deployment

When deploying to production:

1. Update authorized origins and redirect URIs in Google Console
2. Update the OAuth consent screen with production details
3. Submit for verification if you want to remove the "unverified app" warning
4. Update environment variables with production values
