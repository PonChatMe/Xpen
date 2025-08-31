# Firebase Setup Guide for Xpen

This guide will help you set up Firebase authentication for the Xpen financial tracking app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "xpen-financial-tracker")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Enable Google sign-in by toggling the switch
6. Add your authorized domain (localhost for development)
7. Click "Save"

## Step 3: Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "Xpen Web App")
6. Copy the Firebase configuration object

## Step 4: Set Up Environment Variables

1. Create a `.env` file in your project root
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase configuration.

## Step 5: Enable Firestore Database (Optional for Step 9)

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location close to your users
5. Click "Done"

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. Try signing in with Google
4. You should be redirected to the onboarding flow

## Troubleshooting

### Common Issues:

1. **"Firebase configuration not found" error**
   - Make sure your `.env` file is in the project root
   - Restart your development server after adding environment variables
   - Check that all environment variable names start with `VITE_`

2. **"Google sign-in not working"**
   - Ensure Google provider is enabled in Firebase Authentication
   - Check that your domain is authorized in Firebase console
   - For localhost development, make sure "localhost" is in authorized domains

3. **"Permission denied" errors**
   - Check Firestore security rules if using database features
   - Ensure your Firebase project is properly configured

### Security Rules for Firestore (when implementing Step 9):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/accounts/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/transactions/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

After completing this setup, you can proceed to:
- Step 2: Complete Dashboard Core Structure
- Step 3: Implement Accounts Management
- Step 9: Backend Integration with Firestore

## Support

If you encounter any issues, check the Firebase documentation or create an issue in the project repository. 