# Firebase Authentication Setup

This app uses Firebase Google Authentication with email restriction. Only the owner's email (`ichwanharyosembodo96@gmail.com`) can access the application.

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "spending-tracker")
4. Follow the setup wizard

### 2. Enable Google Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Enable it and configure:
   - Project support email: your email
   - Authorized domains: your domain (for production)
6. Save the configuration

### 3. Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the configuration object

### 4. Create Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

### 5. Security Rules

The app is configured to only allow access to `ichwanharyosembodo96@gmail.com`. If you need to change this:

1. Open `src/contexts/AuthContext.tsx`
2. Update the `AUTHORIZED_EMAIL` constant with your email

### 6. Run the Application

```bash
npm run dev
```

The app will now require Google authentication and only allow access to the authorized email address.

## Features

- ✅ Google Authentication
- ✅ Email restriction (only owner can access)
- ✅ Automatic logout for unauthorized users
- ✅ Persistent login state
- ✅ Clean login/logout UI
- ✅ Loading states and error handling

## Security Notes

- The authorized email is hardcoded in the client-side code
- For production, consider implementing server-side authentication checks
- Firebase handles the secure authentication flow
- Unauthorized users are immediately signed out 