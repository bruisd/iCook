# Developer Guide - iCook

Quick reference for developers working on the iCook app.

## Quick Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm start -- -c       # Clear cache and start

# Package Management
npm install           # Install dependencies
npm update            # Update dependencies
npm outdated          # Check for outdated packages
```

## Project Architecture

### Design Patterns
- **Container/Presenter Pattern**: Screens handle logic, components handle presentation
- **Service Layer**: Separate services for Firebase and API calls
- **Custom Hooks**: Reusable logic in hooks (not implemented yet)
- **Type Safety**: TypeScript throughout

### Folder Structure Philosophy
```
src/
├── components/     → Reusable, presentational components
├── screens/        → Screen-level components (containers)
├── navigation/     → Navigation configuration
├── services/       → External service integrations
├── config/         → App configuration
├── types/          → TypeScript type definitions
└── utils/          → Helper functions and utilities
```

## Code Style Guidelines

### Naming Conventions
```typescript
// Components: PascalCase
CustomButton.tsx
IngredientCard.tsx

// Functions: camelCase
const handlePress = () => {}
const formatDate = () => {}

// Constants: UPPER_SNAKE_CASE
const MAX_INGREDIENTS = 100;
const API_BASE_URL = 'https://...';

// Types/Interfaces: PascalCase
interface Recipe {}
type MealType = 'breakfast' | 'lunch';
```

### Component Structure
```typescript
// 1. Imports (grouped)
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onPress: () => void;
}

// 3. Component
const Component: React.FC<ComponentProps> = ({ title, onPress }) => {
  // 3a. State
  const [loading, setLoading] = useState(false);

  // 3b. Hooks
  const navigation = useNavigation();

  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3d. Handlers
  const handlePress = () => {
    // ...
  };

  // 3e. Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// 5. Export
export default Component;
```

## Common Tasks

### Adding a New Screen

1. Create screen file:
```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../config/theme';

const NewScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
  },
});

export default NewScreen;
```

2. Add to navigation types:
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  // ... existing screens
  NewScreen: undefined; // or { param: string } if params needed
};
```

3. Add to navigator:
```typescript
// src/navigation/RootNavigator.tsx
<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={{ title: 'New Screen' }}
/>
```

### Adding a New Component

1. Create component:
```typescript
// src/components/NewComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../config/theme';

interface NewComponentProps {
  title: string;
  onPress?: () => void;
}

const NewComponent: React.FC<NewComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.text,
  },
});

export default NewComponent;
```

2. Import and use:
```typescript
import NewComponent from '../components/NewComponent';

<NewComponent title="Hello" onPress={handlePress} />
```

### Adding a New Firebase Collection

1. Add collection name to config:
```typescript
// src/config/firebase.ts
export const COLLECTIONS = {
  // ... existing
  NEW_COLLECTION: 'newCollection',
};
```

2. Add type:
```typescript
// src/types/index.ts
export interface NewItem {
  id: string;
  name: string;
  createdAt: Date;
}
```

3. Add service functions:
```typescript
// src/services/firebaseService.ts
export const addNewItem = async (item: Omit<NewItem, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NEW_COLLECTION), {
      ...item,
      createdAt: Timestamp.fromDate(new Date()),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};
```

### Using Theme Colors

```typescript
import { colors, spacing, fontSize, fontWeight } from '../config/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
```

### Adding Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Light impact (for list items, minor actions)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium impact (for buttons, standard actions)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy impact (for important actions)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Warning notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Error notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

## Debugging

### Common Issues

#### 1. Module Resolution Errors
```bash
# Clear Metro bundler cache
npx expo start -c

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 2. Firebase Connection Issues
- Check Firebase config is correct
- Ensure Firestore is enabled
- Verify test mode rules are active
- Check internet connection

#### 3. Navigation Type Errors
- Ensure screen is added to navigation types
- Check param types match
- Verify navigator imports screen

#### 4. StyleSheet Issues
- Always use StyleSheet.create()
- Import theme constants
- Check for typos in style names

### Debugging Tools

#### React Native Debugger
```bash
# Install
brew install --cask react-native-debugger

# Start
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

#### Flipper
```bash
# Install
brew install --cask flipper

# Already configured in Expo
```

#### Console Logs
```typescript
console.log('Debug:', value);
console.error('Error:', error);
console.warn('Warning:', warning);
```

## Performance Tips

### Optimize Lists
```typescript
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### Memoize Components
```typescript
import React, { memo } from 'react';

const Component = memo(({ data }) => {
  return <View>...</View>;
});
```

### Use Callbacks
```typescript
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### Image Optimization
```typescript
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>
```

## Testing

### Manual Testing Checklist

#### Navigation
- [ ] All screens accessible
- [ ] Back button works
- [ ] Tab switching works
- [ ] Deep linking works (if implemented)

#### Forms
- [ ] Required fields validated
- [ ] Error messages display
- [ ] Success feedback shown
- [ ] Form resets after submit

#### Data
- [ ] Data loads correctly
- [ ] Data saves correctly
- [ ] Data updates correctly
- [ ] Data deletes correctly

#### UI/UX
- [ ] Smooth animations
- [ ] Haptic feedback works
- [ ] Loading states show
- [ ] Empty states show
- [ ] Error states show

### Unit Testing (Future)
```typescript
// Install Jest
npm install --save-dev jest @testing-library/react-native

// Example test
import { render } from '@testing-library/react-native';
import Component from '../Component';

test('renders correctly', () => {
  const { getByText } = render(<Component />);
  expect(getByText('Hello')).toBeTruthy();
});
```

## Git Workflow

### Branches
```bash
# Main branches
main          # Production-ready code
develop       # Development branch

# Feature branches
feature/add-favorites
feature/dark-mode

# Bug fix branches
fix/login-error
fix/navigation-crash
```

### Commits
```bash
# Format: type(scope): message

# Types
feat:     # New feature
fix:      # Bug fix
refactor: # Code refactoring
style:    # Code style changes
docs:     # Documentation
test:     # Tests
chore:    # Maintenance

# Examples
git commit -m "feat(recipes): add search functionality"
git commit -m "fix(fridge): resolve expiration date bug"
git commit -m "refactor(theme): extract color constants"
```

### Before Committing
```bash
# Check status
git status

# Review changes
git diff

# Stage files
git add src/

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/branch-name
```

## Environment Variables (Future)

Create `.env` file:
```bash
FIREBASE_API_KEY=your_key
SPOONACULAR_API_KEY=your_key
```

Load in app:
```typescript
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.spoonacularApiKey;
```

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Firebase Docs](https://firebase.google.com/docs)

### Communities
- [React Native Community](https://reactnative.dev/community/overview)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Tools
- [React Native Directory](https://reactnative.directory/)
- [Can I Use](https://caniuse.com/)
- [Expo Snack](https://snack.expo.dev/)

## Best Practices

### Do's ✅
- Use TypeScript types everywhere
- Handle errors gracefully
- Show loading states
- Provide user feedback
- Use theme constants
- Write meaningful comments
- Keep components small
- Follow naming conventions

### Don'ts ❌
- Don't commit API keys
- Don't ignore TypeScript errors
- Don't skip error handling
- Don't hardcode values
- Don't create god components
- Don't forget loading states
- Don't skip empty states

---

**Happy Coding! 🚀**
