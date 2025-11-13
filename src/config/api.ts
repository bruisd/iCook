// API configuration for recipe generation
// Using Spoonacular API - https://spoonacular.com/food-api
//
// API key is loaded from environment variables
// See .env.example for setup instructions

import { SPOONACULAR_API_KEY } from '@env';

export const API_CONFIG = {
  SPOONACULAR: {
    BASE_URL: "https://api.spoonacular.com",
    API_KEY: SPOONACULAR_API_KEY,
    ENDPOINTS: {
      FIND_BY_INGREDIENTS: "/recipes/findByIngredients",
      GET_RECIPE_INFO: "/recipes/{id}/information",
      RANDOM_RECIPES: "/recipes/random",
      SEARCH_RECIPES: "/recipes/complexSearch",
    },
  },
};

// Helper function to check if API key is configured
export const isApiConfigured = (): boolean => {
  return !!API_CONFIG.SPOONACULAR.API_KEY &&
         API_CONFIG.SPOONACULAR.API_KEY !== "YOUR_SPOONACULAR_API_KEY" &&
         API_CONFIG.SPOONACULAR.API_KEY !== "your_spoonacular_api_key_here";
};
