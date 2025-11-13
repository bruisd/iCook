// Navigation types for type-safe navigation
import { Recipe, MealHistory, Ingredient } from '../types';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: { screen?: 'Home' | 'Saved' | 'Summary' | 'Profile' } | undefined;
  RecipeDetail: { recipe: Recipe };
  AddIngredient: { ingredientId?: string };
  RecipesResults: { ingredients: string[] };
};

export type MainTabParamList = {
  Home: undefined;
  Saved: undefined;
  Summary: undefined;
  Profile: undefined;
};

// Add RecipesResults to RootStack for recipe generation
export type RecipesResultsParams = {
  ingredients: string[];
};
