# Quick Start - iCook

Get up and running in 5 minutes!

## Prerequisites Check

```bash
node --version    # Should be v18+
npm --version     # Should be 8+
```

## Installation

```bash
# 1. Navigate to project
cd iCook

# 2. Install dependencies (2-3 minutes)
npm install
```

## Configuration

### Firebase Setup (2 minutes)

1. **Go to**: [console.firebase.google.com](https://console.firebase.google.com/)
2. **Create** a new project → "iCook"
3. **Click** web icon (</>) → Register app
4. **Copy** the firebaseConfig object
5. **Paste** into `src/config/firebase.ts`
6. **Enable** Firestore Database → Create database → Test mode

### Spoonacular API Setup (1 minute)

1. **Go to**: [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. **Sign up** for free account
3. **Copy** API key from console
4. **Paste** into `src/config/api.ts`

## Run the App

### Option A: Physical Device (Recommended)

```bash
# 1. Install Expo Go on your phone
# iOS: App Store
# Android: Google Play Store

# 2. Start the server
npm start

# 3. Scan QR code with Expo Go
```

### Option B: iOS Simulator (Mac Only)

```bash
npm run ios
```

### Option C: Android Emulator

```bash
npm run android
```

## First Time Testing

### Test Workflow

1. **Add Ingredients** (Fridge tab):
   - Chicken Breast (500g, Meat)
   - Tomatoes (4 pieces, Vegetables)
   - Mozzarella (200g, Dairy)

2. **Generate Recipes** (Recipes tab):
   - Click "Generate from Fridge"
   - Wait 5-10 seconds
   - Browse generated recipes

3. **View Recipe Details**:
   - Tap any recipe card
   - Scroll through ingredients and instructions
   - Click "Mark as Cooked"

4. **Log a Meal**:
   - Select meal type (e.g., Lunch)
   - Rate 5 stars
   - Add note: "Delicious!"
   - Click Save

5. **Check History** (History tab):
   - View your logged meal
   - Check statistics

## Troubleshooting

### App Won't Start?
```bash
npx expo start -c
```

### Firebase Not Working?
- Check your config is copied correctly
- Ensure Firestore is enabled in Firebase Console
- Verify you're in "Test Mode"

### API Not Working?
- Verify API key is correct
- Check you haven't exceeded 150 requests/day
- Test API key at spoonacular.com/food-api/console

### Still Having Issues?
1. Check SETUP_GUIDE.md for detailed instructions
2. Check DEVELOPER_GUIDE.md for debugging tips
3. Clear cache: `npx expo start -c`
4. Reinstall: `rm -rf node_modules && npm install`

## Project Structure Overview

```
iCook/
├── src/
│   ├── components/      → Reusable UI components (6)
│   ├── screens/         → App screens (6)
│   ├── navigation/      → Navigation setup
│   ├── services/        → Firebase & API services
│   ├── config/          → Configuration files
│   ├── types/           → TypeScript types
│   └── utils/           → Helper functions
├── App.tsx             → Main entry point
├── app.json            → Expo configuration
└── package.json        → Dependencies
```

## Key Files to Configure

1. `src/config/firebase.ts` - **REQUIRED** - Firebase configuration
2. `src/config/api.ts` - **REQUIRED** - Spoonacular API key
3. `app.json` - Optional - App name, bundle ID

## Available Scripts

```bash
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator (Mac only)
npm run android     # Run on Android emulator
npm start -- -c     # Start with cache cleared
```

## What You Get

### Features
- ✅ Fridge inventory management
- ✅ AI recipe generation
- ✅ Recipe details with nutrition
- ✅ Meal tracking & history
- ✅ Beautiful Wolt-inspired UI
- ✅ Smooth animations & haptics

### Tech Stack
- React Native + Expo
- TypeScript
- Firebase Firestore
- Spoonacular API
- React Navigation
- 15+ libraries

### Components Ready
- 6 reusable components
- 6 complete screens
- Full navigation setup
- Service layer
- Type definitions
- Utilities

## Next Steps

1. ✅ Get the app running
2. ✅ Test all features
3. 📖 Read DEVELOPER_GUIDE.md for development
4. 🎨 Customize theme in `src/config/theme.ts`
5. 🚀 Add your own features!

## Documentation

- **README.md** - Project overview
- **SETUP_GUIDE.md** - Detailed setup (⭐ Start here)
- **DEVELOPER_GUIDE.md** - Development guide
- **PROJECT_SUMMARY.md** - Technical details
- **QUICK_START.md** - This file

## Support

Having issues? Check:
1. Node.js version (v18+)
2. npm version (8+)
3. Firebase config
4. API key
5. Internet connection

Still stuck? Review the documentation files above.

---

**Time to First Run: ~5 minutes**

**Total Setup Time: ~10 minutes**

**Happy Cooking! 👨‍🍳👩‍🍳**
