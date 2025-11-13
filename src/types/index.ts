// Core type definitions for iCook app

export type IngredientCategory =
  | 'dairy'
  | 'vegetables'
  | 'meat'
  | 'fish'
  | 'fruits'
  | 'grains'
  | 'spices'
  | 'condiments'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number; // in minutes
  difficulty: DifficultyLevel;
  servings?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sourceApi?: string; // which API provided this recipe
  externalId?: string; // ID from external API
}

export interface MealHistory {
  id: string;
  recipeId: string;
  recipe: Recipe;
  mealType: MealType;
  date: Date;
  rating?: number; // 1-5 stars
  notes?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: Date;
  // For future authentication implementation
}

// API Response types for recipe generation
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: any[];
  usedIngredients?: any[];
  unusedIngredients?: any[];
  likes?: number;
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  extendedIngredients: {
    id: number;
    original: string;
    name: string;
  }[];
  analyzedInstructions: {
    name: string;
    steps: {
      number: number;
      step: string;
    }[];
  }[];
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}
