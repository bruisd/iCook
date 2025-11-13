// Recipe API service using Spoonacular API
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { Recipe, RecipeDetails, SpoonacularRecipe, DifficultyLevel } from '../types';

const api = axios.create({
  baseURL: API_CONFIG.SPOONACULAR.BASE_URL,
  params: {
    apiKey: API_CONFIG.SPOONACULAR.API_KEY,
  },
});

// Helper function to determine difficulty based on cooking time and steps
const getDifficulty = (minutes: number, stepsCount: number): DifficultyLevel => {
  if (minutes <= 30 && stepsCount <= 5) return 'easy';
  if (minutes <= 60 && stepsCount <= 10) return 'medium';
  return 'hard';
};

// Helper function to extract nutrition info
const extractNutrition = (nutrients?: any[]) => {
  if (!nutrients) return {};

  const findNutrient = (name: string) => {
    const nutrient = nutrients.find(n => n.name.toLowerCase() === name.toLowerCase());
    return nutrient ? Math.round(nutrient.amount) : undefined;
  };

  return {
    calories: findNutrient('Calories'),
    protein: findNutrient('Protein'),
    carbs: findNutrient('Carbohydrates'),
    fat: findNutrient('Fat'),
  };
};

// Convert Spoonacular recipe to our Recipe type
const convertToRecipe = (spoonacularRecipe: RecipeDetails): Recipe => {
  const instructions = spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map(
    step => step.step
  ) || [];

  const ingredients = spoonacularRecipe.extendedIngredients?.map(
    ing => ing.original
  ) || [];

  const difficulty = getDifficulty(
    spoonacularRecipe.readyInMinutes,
    instructions.length
  );

  const nutrition = extractNutrition(spoonacularRecipe.nutrition?.nutrients);

  return {
    id: spoonacularRecipe.id.toString(),
    title: spoonacularRecipe.title,
    imageUrl: spoonacularRecipe.image,
    ingredients,
    instructions,
    cookingTime: spoonacularRecipe.readyInMinutes,
    difficulty,
    servings: spoonacularRecipe.servings,
    sourceApi: 'spoonacular',
    externalId: spoonacularRecipe.id.toString(),
    ...nutrition,
  };
};

/**
 * Find recipes based on available ingredients
 * @param ingredients - Array of ingredient names
 * @param number - Number of recipes to return (default: 10)
 */
export const findRecipesByIngredients = async (
  ingredients: string[],
  number: number = 10
): Promise<Recipe[]> => {
  try {
    // First, get recipes by ingredients - request more for variety
    const response = await api.get<SpoonacularRecipe[]>(
      API_CONFIG.SPOONACULAR.ENDPOINTS.FIND_BY_INGREDIENTS,
      {
        params: {
          ingredients: ingredients.join(','),
          number: number * 2, // Get more recipes for better variety
          ranking: 1, // Balance used ingredients with variety (1=minimize missing, 2=maximize used)
          ignorePantry: true, // Don't assume common pantry items
        },
      }
    );

    // Shuffle results for variety on each call
    const shuffled = [...response.data].sort(() => Math.random() - 0.5);

    // Then, fetch detailed information for each recipe
    const recipePromises = shuffled.slice(0, number).map(async (recipe) => {
      const detailsResponse = await api.get<RecipeDetails>(
        API_CONFIG.SPOONACULAR.ENDPOINTS.GET_RECIPE_INFO.replace(
          '{id}',
          recipe.id.toString()
        ),
        {
          params: {
            includeNutrition: true,
          },
        }
      );
      return convertToRecipe(detailsResponse.data);
    });

    const recipes = await Promise.all(recipePromises);
    return recipes;
  } catch (error: any) {
    console.error('Error finding recipes by ingredients:', error);

    // Provide helpful error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your Spoonacular API configuration.');
    } else if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please check your Spoonacular plan limits.');
    }

    throw new Error('Failed to fetch recipes. Please try again later.');
  }
};

/**
 * Get random recipes for inspiration
 * @param number - Number of recipes to return (default: 5)
 */
export const getRandomRecipes = async (number: number = 5): Promise<Recipe[]> => {
  try {
    const response = await api.get(
      API_CONFIG.SPOONACULAR.ENDPOINTS.RANDOM_RECIPES,
      {
        params: {
          number,
          includeNutrition: true,
        },
      }
    );

    return response.data.recipes.map((recipe: RecipeDetails) =>
      convertToRecipe(recipe)
    );
  } catch (error: any) {
    console.error('Error getting random recipes:', error);

    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your Spoonacular API configuration.');
    } else if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please check your Spoonacular plan limits.');
    }

    throw new Error('Failed to fetch recipes. Please try again later.');
  }
};

/**
 * Search recipes by query
 * @param query - Search query
 * @param number - Number of results (default: 10)
 */
export const searchRecipes = async (
  query: string,
  number: number = 10
): Promise<Recipe[]> => {
  try {
    const response = await api.get(
      API_CONFIG.SPOONACULAR.ENDPOINTS.SEARCH_RECIPES,
      {
        params: {
          query,
          number,
          addRecipeInformation: true,
          fillIngredients: true,
          includeNutrition: true,
        },
      }
    );

    const recipePromises = response.data.results.map(async (recipe: any) => {
      const detailsResponse = await api.get<RecipeDetails>(
        API_CONFIG.SPOONACULAR.ENDPOINTS.GET_RECIPE_INFO.replace(
          '{id}',
          recipe.id.toString()
        ),
        {
          params: {
            includeNutrition: true,
          },
        }
      );
      return convertToRecipe(detailsResponse.data);
    });

    return await Promise.all(recipePromises);
  } catch (error: any) {
    console.error('Error searching recipes:', error);

    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your Spoonacular API configuration.');
    } else if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please check your Spoonacular plan limits.');
    }

    throw new Error('Failed to search recipes. Please try again later.');
  }
};
