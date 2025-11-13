import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fontSize, fontWeight } from '../config/theme';
import { RootStackParamList } from './types';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TabNavigator from './TabNavigator';
import NewRecipeDetailScreen from '../screens/NewRecipeDetailScreen';
import AddIngredientScreen from '../screens/AddIngredientScreen';
import RecipesResultsScreen from '../screens/RecipesResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontSize: fontSize.lg,
          fontWeight: fontWeight.bold,
          color: colors.text,
        },
        headerTintColor: colors.primary,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back to auth screens
        }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={NewRecipeDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddIngredient"
        component={AddIngredientScreen}
        options={({ route }) => ({
          title: route.params?.ingredientId ? 'Edit Ingredient' : 'Add Ingredient',
        })}
      />
      <Stack.Screen
        name="RecipesResults"
        component={RecipesResultsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
