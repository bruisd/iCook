# iCook - Detailed Setup Guide

This guide provides detailed, step-by-step instructions for setting up the iCook app from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Spoonacular API Setup](#spoonacular-api-setup)
4. [Project Configuration](#project-configuration)
5. [Running the App](#running-the-app)
6. [Testing](#testing)

---

## Prerequisites

### Required Software

#### 1. Node.js and npm

**Check if installed:**

```bash
node --version  # Should be v18 or higher
npm --version
```

**Install if needed:**

- Download from [nodejs.org](https://nodejs.org/)
- Use nvm (recommended):
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18
  ```

#### 2. Expo CLI

```bash
npm install -g expo-cli
```

#### 3. Development Environment

**For iOS (Mac only):**

- Xcode from Mac App Store
- Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```

**For Android:**

- [Android Studio](https://developer.android.com/studio)
- Configure Android SDK
- Set up Android Emulator

**For Physical Device:**

- Install Expo Go:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Firebase Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**

   - Visit [console.firebase.google.com](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Enter project name: "iCook" (or your preferred name)
   - Click "Continue"
   - Toggle Google Analytics (optional, recommended for production)
   - Click "Create project"
   - Wait for project creation (~30 seconds)
   - Click "Continue"

### Step 2: Register Web App

1. **Add Web App to Project**

   - On the project overview page, click the web icon `</>`
   - App nickname: "iCook Web"
   - DON'T check "Set up Firebase Hosting"
   - Click "Register app"

2. **Copy Configuration**

   - You'll see a code snippet with `firebaseConfig`
   - Copy the entire configuration object (looks like this):

   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyAbKI7yXg2znkhRN9AiqzRbL7jiU190lm4",
     authDomain: "icook-4a316.firebaseapp.com",
     projectId: "icook-4a316",
     storageBucket: "icook-4a316.firebasestorage.app",
     messagingSenderId: "441699690379",
     appId: "1:441699690379:web:e6c232e283e8fc54abf18e",
     measurementId: "G-6W5LPD61QJ",
   };
   ```

   - Click "Continue to console"

### Step 3: Enable Firestore Database

1. **Navigate to Firestore**

   - In the left sidebar, click "Firestore Database"
   - Click "Create database"

2. **Choose Mode**

   - Select "Start in test mode"
   - Note: This allows read/write access for testing. Change to production mode later!
   - Click "Next"

3. **Select Location**

   - Choose a location closest to your target users
   - Examples: us-central1, europe-west1, asia-northeast1
   - Click "Enable"
   - Wait for database creation (~1 minute)

4. **Verify Database is Created**
   - You should see the Firestore console with "Start collection" button
   - No need to create collections manually - the app will create them

### Step 4: Configure Firestore Rules (Optional for Production)

For development, test mode is fine. For production, add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ingredients collection
    match /ingredients/{document=**} {
      allow read, write: if true;  // Change this in production
    }

    // Recipes collection
    match /recipes/{document=**} {
      allow read, write: if true;
    }

    // Meal History collection
    match /mealHistory/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 5: Update App Configuration

1. **Open Firebase Config File**

   ```bash
   # Open in your code editor
   code src/config/firebase.ts
   # or
   nano src/config/firebase.ts
   ```

2. **Replace Configuration**
   - Find this section:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```
   - Replace with your actual Firebase config (copied in Step 2)
   - Save the file

---

## Spoonacular API Setup

### Step 1: Create Spoonacular Account

1. **Visit Spoonacular Website**

   - Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
   - Click "Get Started" or "Start Now"

2. **Sign Up**

   - Click "Sign Up" in the top right
   - Fill in your details:
     - Email address
     - Password
     - Name
   - Agree to terms
   - Click "Sign Up"

3. **Verify Email**
   - Check your email for verification link
   - Click the verification link

### Step 2: Get API Key

1. **Go to Console**

   - After logging in, click "My Console" or visit [spoonacular.com/food-api/console#Dashboard](https://spoonacular.com/food-api/console#Dashboard)

2. **View Your API Key**

   - On the dashboard, you'll see "Your API Key"
   - Copy the API key (it's a long string like: `8ff439cd1e0e439c92753cf017b93910`)

3. **Check Your Plan**
   - Free tier: 150 points/day
   - Each recipe search ≈ 1 point
   - Each recipe details ≈ 1 point
   - Total: ~150 recipe requests per day

### Step 3: Update App Configuration

1. **Open API Config File**

   ```bash
   code src/config/api.ts
   ```

2. **Replace API Key**
   - Find this line:
   ```typescript
   API_KEY: 'YOUR_SPOONACULAR_API_KEY',
   ```
   - Replace with your actual API key:
   ```typescript
   API_KEY: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
   ```
   - Save the file

### Step 4: Test API Key (Optional)

```bash
# Test in terminal (replace YOUR_API_KEY)
curl "https://api.spoonacular.com/recipes/random?apiKey=YOUR_API_KEY&number=1"

# Should return JSON with recipe data
```

---

## Project Configuration

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd iCook

# Install all dependencies
npm install

# This may take 2-5 minutes
```

### Step 2: Verify Installation

```bash
# Check for errors in the output
# You should see "added XXX packages" at the end

# Verify key packages are installed
npm list expo
npm list firebase
npm list @react-navigation/native
```

### Step 3: Configure TypeScript (Already Done)

The project already has `tsconfig.json` configured. Verify it exists:

```bash
ls tsconfig.json
```

### Step 4: Update app.json (Optional)

Open `app.json` and customize:

- `name`: Your app display name
- `slug`: Your app identifier
- `bundleIdentifier` (iOS): Your unique identifier
- `package` (Android): Your unique package name

---

## Running the App

### Option 1: Expo Go (Easiest)

1. **Start Development Server**

   ```bash
   npm start
   # or
   npx expo start
   ```

2. **Open on Device**
   - A QR code will appear in the terminal
   - Open Expo Go app on your phone
   - Scan the QR code
   - Wait for app to load (~30 seconds first time)

### Option 2: iOS Simulator (Mac Only)

1. **Ensure Xcode is Installed**

   ```bash
   xcode-select -p
   # Should output: /Applications/Xcode.app/Contents/Developer
   ```

2. **Start on iOS**

   ```bash
   npm run ios
   # or
   npx expo start --ios
   ```

3. **First Time Setup**
   - Expo may ask to install Expo Go on simulator
   - Click "Install" and wait
   - App will launch automatically

### Option 3: Android Emulator

1. **Ensure Android Studio is Set Up**

   ```bash
   # Check if Android SDK is installed
   echo $ANDROID_HOME
   # Should show path like: /Users/username/Library/Android/sdk
   ```

2. **Start Android Emulator**

   - Open Android Studio
   - Click "AVD Manager"
   - Click "Play" button on an emulator
   - Wait for emulator to fully boot

3. **Start on Android**
   ```bash
   npm run android
   # or
   npx expo start --android
   ```

### Common Issues and Solutions

**Issue: "Unable to resolve module"**

```bash
# Clear cache and restart
npx expo start -c
```

**Issue: "Network error" when connecting**

```bash
# Make sure your phone and computer are on the same WiFi network
# Try using tunnel mode:
npx expo start --tunnel
```

**Issue: Firebase errors**

- Double-check your Firebase config is correct
- Ensure Firestore is enabled
- Check Firebase console for any errors

**Issue: API errors**

- Verify your Spoonacular API key is correct
- Check you haven't exceeded daily limit (150 requests)
- Try testing the API key in browser or Postman

---

## Testing

### Manual Testing Checklist

#### 1. Fridge Inventory

- [ ] Add a new ingredient
- [ ] Edit an ingredient
- [ ] Delete an ingredient
- [ ] Search for ingredients
- [ ] Filter by category
- [ ] Check expiration date warnings

#### 2. Recipe Generation

- [ ] Generate recipes with ingredients
- [ ] View recipe list
- [ ] Tap on recipe to see details
- [ ] Get random recipes

#### 3. Recipe Details

- [ ] View recipe image
- [ ] Read ingredients list
- [ ] Read instructions
- [ ] Check nutrition info
- [ ] Mark as cooked

#### 4. Meal History

- [ ] Log a meal
- [ ] Rate a meal
- [ ] Add notes
- [ ] View meal history
- [ ] Filter by time period
- [ ] View statistics

#### 5. Navigation

- [ ] Switch between tabs
- [ ] Navigate back
- [ ] Check smooth transitions

### Test Data

Add these test ingredients:

1. Chicken Breast - 500g - Meat
2. Tomatoes - 4 pieces - Vegetables
3. Mozzarella - 200g - Dairy
4. Olive Oil - 1 bottle - Condiments
5. Garlic - 3 cloves - Vegetables

Expected behavior:

- Should generate Italian recipes (pasta, pizza, etc.)
- Recipes should include these ingredients

---

## Next Steps

### Development

1. Customize the app theme in `src/config/theme.ts`
2. Add your own features
3. Test thoroughly on both iOS and Android
4. Fix any bugs you find

### Production Preparation

1. Update Firebase rules for security
2. Consider upgrading Spoonacular plan
3. Add error tracking (Sentry, Bugsnag)
4. Add analytics (Firebase Analytics, Mixpanel)
5. Test on multiple devices
6. Create app icons and splash screens
7. Set up CI/CD pipeline

### Deployment

1. Build standalone app:
   ```bash
   expo build:ios
   expo build:android
   ```
2. Submit to App Store / Play Store
3. Monitor usage and errors
4. Iterate based on user feedback

---

## Support Resources

- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev/)
- **React Native Documentation**: [reactnative.dev](https://reactnative.dev/)
- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Spoonacular API Docs**: [spoonacular.com/food-api/docs](https://spoonacular.com/food-api/docs)
- **React Navigation**: [reactnavigation.org](https://reactnavigation.org/)

---

**Congratulations! You should now have the iCook app running successfully! 🎉**
