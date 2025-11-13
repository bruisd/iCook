# iCook - AI-Powered Recipe Discovery App

A beautiful React Native mobile application that helps you discover recipes based on ingredients you have in your fridge, powered by AI recipe generation and built with Expo.

## Features

### Core Features
- **Fridge Inventory Management**: Add, edit, and track ingredients with expiration dates
- **AI Recipe Generation**: Get personalized recipe suggestions based on your available ingredients
- **Recipe Details**: View comprehensive recipe information including ingredients, instructions, cooking time, and nutrition
- **Meal History**: Track what you've cooked with calendar view and statistics
- **Beautiful UI**: Wolt-inspired design with smooth animations and haptic feedback

### Technical Features
- TypeScript for type safety
- Firebase Firestore for data persistence
- Spoonacular API integration for recipe generation
- React Navigation with smooth transitions
- Haptic feedback for enhanced user experience
- Responsive design for different screen sizes
- Skeleton loaders and empty states

## Screenshots

*Note: Add screenshots of your app here once it's running*

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio for emulators
- Expo Go app on your physical device (optional)

## Installation

### 1. Clone or Navigate to the Project

```bash
cd iCook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

#### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "iCook")

#### Step 2: Get Firebase Config
1. After registering, you'll see your Firebase configuration object
2. Copy the configuration object

#### Step 3: Update Firebase Config File
1. Open `src/config/firebase.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

#### Step 4: Enable Firestore
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location closest to you
5. Click "Enable"

### 4. Configure Spoonacular API

#### Step 1: Get API Key
1. Go to [Spoonacular API](https://spoonacular.com/food-api)
2. Click "Get Started" and create a free account
3. Go to your [console](https://spoonacular.com/food-api/console#Dashboard)
4. Copy your API key (Free tier includes 150 requests/day)

#### Step 2: Update API Config
1. Open `src/config/api.ts`
2. Replace the placeholder with your actual API key:

```typescript
API_KEY: 'YOUR_ACTUAL_SPOONACULAR_API_KEY',
```

## Running the App

### Start Development Server

```bash
npm start
```

or

```bash
npx expo start
```

### Run on iOS Simulator (Mac only)

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run on Physical Device
1. Install Expo Go from App Store or Google Play
2. Scan the QR code shown in your terminal
3. The app will load on your device

## Project Structure

```
iCook/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CustomButton.tsx
│   │   ├── IngredientCard.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── MealHistoryCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   ├── config/             # Configuration files
│   │   ├── api.ts          # API configuration
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── theme.ts        # App theme (colors, spacing, etc.)
│   ├── navigation/         # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── FridgeScreen.tsx
│   │   ├── AddIngredientScreen.tsx
│   │   ├── RecipesScreen.tsx
│   │   ├── RecipeDetailScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/          # API and Firebase services
│   │   ├── firebaseService.ts
│   │   └── recipeService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── helpers.ts
├── App.tsx               # Main app entry point
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Usage Guide

### 1. Adding Ingredients
1. Tap on the "Fridge" tab
2. Tap the + button (floating action button)
3. Enter ingredient details:
   - Name (required)
   - Quantity (required)
   - Category (required)
   - Expiration date (optional)
4. Tap "Add Ingredient"

### 2. Generating Recipes
1. Tap on the "Recipes" tab
2. Tap "Generate from Fridge" to get recipes based on your ingredients
3. Or tap "Get Random Recipes" for inspiration
4. Browse through the generated recipes
5. Tap on any recipe to view details

### 3. Viewing Recipe Details
1. Tap on a recipe card
2. View comprehensive information:
   - Ingredients list
   - Step-by-step instructions
   - Cooking time and difficulty
   - Nutritional information
3. Tap "Mark as Cooked" to log the meal

### 4. Logging Meals
1. When viewing a recipe, tap "Mark as Cooked"
2. Select meal type (breakfast, lunch, dinner, snack)
3. Optionally add a rating (1-5 stars)
4. Optionally add notes
5. Tap "Save" to log the meal

### 5. Viewing Meal History
1. Tap on the "History" tab
2. View your logged meals grouped by date
3. Filter by time period (All Time, This Week, This Month)
4. View statistics (total meals, calories, average rating)
5. Tap on any meal to view the recipe again

## API Usage and Limits

### Spoonacular API (Free Tier)
- **Requests per day**: 150
- **Points per day**: 150 (most endpoints cost 1 point)
- **Rate limit**: No specific limit

**Tips to conserve API usage:**
- Use the "Generate from Fridge" feature sparingly during development
- The app caches recipes once loaded
- Consider upgrading to a paid plan for production use

### Firebase Firestore (Spark Plan - Free)
- **Reads per day**: 50,000
- **Writes per day**: 20,000
- **Deletes per day**: 20,000
- **Storage**: 1 GB

## Troubleshooting

### Firebase Connection Issues
- Ensure your Firebase config is correctly copied
- Check that Firestore is enabled in Firebase Console
- Verify your Firebase project is in test mode (for development)

### API Key Issues
- Verify your Spoonacular API key is valid
- Check that you haven't exceeded your daily limit
- Make sure there are no extra spaces in the API key

### App Won't Start
```bash
# Clear cache and restart
npx expo start -c
```

### iOS Build Issues (Mac)
```bash
# Reinstall pods
cd ios && pod install && cd ..
```

### Android Build Issues
```bash
# Clean build
cd android && ./gradlew clean && cd ..
```

## Future Enhancements

- [ ] User authentication (email/password, Google, Apple)
- [ ] Recipe favorites/bookmarks
- [ ] Shopping list generation
- [ ] Recipe sharing
- [ ] Meal planning calendar
- [ ] Recipe search functionality
- [ ] Camera integration for ingredient photos
- [ ] Dark mode support
- [ ] Multiple language support
- [ ] Dietary restrictions and preferences
- [ ] Recipe ratings and reviews

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **Firebase Firestore**: NoSQL cloud database
- **Spoonacular API**: Recipe and nutrition data
- **Expo Haptics**: Haptic feedback
- **React Native Gesture Handler**: Gesture handling
- **React Native Reanimated**: Animations
- **date-fns**: Date manipulation

## Contributing

This is a learning project. Feel free to fork and modify for your own use!

## License

MIT License - feel free to use this project for learning and personal use.

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Ensure all dependencies are properly installed
3. Verify your API keys are correctly configured
4. Check that Firebase is properly set up

## Acknowledgments

- Design inspiration from Wolt app
- Recipe data powered by Spoonacular API
- Icons from Ionicons
- Backend powered by Firebase

---

**Happy Cooking! 👨‍🍳👩‍🍳**
