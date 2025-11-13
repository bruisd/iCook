// Firebase Firestore service functions
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { Ingredient, Recipe, MealHistory, MealType } from '../types';

// ============= INGREDIENTS =============

export const addIngredient = async (
  ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTIONS.INGREDIENTS), {
      ...ingredient,
      expirationDate: ingredient.expirationDate
        ? Timestamp.fromDate(ingredient.expirationDate)
        : null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
};

export const updateIngredient = async (
  id: string,
  updates: Partial<Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const ingredientRef = doc(db, COLLECTIONS.INGREDIENTS, id);
    const updateData: any = {
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Only include fields that are explicitly being updated
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.category !== undefined) updateData.category = updates.category;

    // Handle expiration date - if it's explicitly undefined, remove it from Firestore
    if ('expirationDate' in updates) {
      if (updates.expirationDate) {
        updateData.expirationDate = Timestamp.fromDate(updates.expirationDate);
      } else {
        updateData.expirationDate = deleteField();
      }
    }

    await updateDoc(ingredientRef, updateData);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    throw error;
  }
};

export const deleteIngredient = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INGREDIENTS, id));
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
};

export const getIngredientById = async (id: string): Promise<Ingredient | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.INGREDIENTS, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      quantity: data.quantity,
      category: data.category,
      expirationDate: data.expirationDate?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error getting ingredient:', error);
    throw error;
  }
};

export const getAllIngredients = async (): Promise<Ingredient[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.INGREDIENTS),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        quantity: data.quantity,
        category: data.category,
        expirationDate: data.expirationDate?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting ingredients:', error);
    throw error;
  }
};

// ============= RECIPES =============

export const saveRecipe = async (
  recipe: Recipe
): Promise<string> => {
  try {
    // Check if recipe already exists by external ID
    if (recipe.externalId) {
      const q = query(
        collection(db, COLLECTIONS.RECIPES),
        where('externalId', '==', recipe.externalId)
      );
      const existingRecipes = await getDocs(q);

      // If recipe already exists, return its Firebase ID
      if (!existingRecipes.empty) {
        return existingRecipes.docs[0].id;
      }
    }

    // Save new recipe (exclude the id field from the recipe object)
    const { id, ...recipeData } = recipe;
    const docRef = await addDoc(collection(db, COLLECTIONS.RECIPES), recipeData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

export const getSavedRecipes = async (): Promise<Recipe[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.RECIPES));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Recipe[];
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    throw error;
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.RECIPES, id));
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// ============= MEAL HISTORY =============

export const addMealHistory = async (
  recipeId: string,
  recipe: Recipe,
  mealType: MealType,
  date: Date = new Date(),
  rating?: number,
  notes?: string
): Promise<string> => {
  try {
    // Build data object, excluding undefined fields
    const mealData: any = {
      recipeId,
      recipe,
      mealType,
      date: Timestamp.fromDate(date),
      createdAt: Timestamp.fromDate(new Date()),
    };

    // Only add optional fields if they are defined
    if (rating !== undefined) {
      mealData.rating = rating;
    }
    if (notes !== undefined) {
      mealData.notes = notes;
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.MEAL_HISTORY), mealData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding meal history:', error);
    throw error;
  }
};

export const getMealHistory = async (
  startDate?: Date,
  endDate?: Date
): Promise<MealHistory[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.MEAL_HISTORY),
      orderBy('date', 'desc')
    );

    if (startDate && endDate) {
      q = query(
        collection(db, COLLECTIONS.MEAL_HISTORY),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        recipeId: data.recipeId,
        recipe: data.recipe,
        mealType: data.mealType,
        date: data.date.toDate(),
        rating: data.rating,
        notes: data.notes,
        createdAt: data.createdAt.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting meal history:', error);
    throw error;
  }
};

export const updateMealHistory = async (
  id: string,
  updates: { rating?: number; notes?: string }
): Promise<void> => {
  try {
    const mealRef = doc(db, COLLECTIONS.MEAL_HISTORY, id);
    await updateDoc(mealRef, updates);
  } catch (error) {
    console.error('Error updating meal history:', error);
    throw error;
  }
};

export const deleteMealHistory = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEAL_HISTORY, id));
  } catch (error) {
    console.error('Error deleting meal history:', error);
    throw error;
  }
};
