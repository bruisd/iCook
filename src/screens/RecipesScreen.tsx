import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getAllIngredients } from '../services/firebaseService';
import { findRecipesByIngredients, getRandomRecipes } from '../services/recipeService';
import { isApiConfigured } from '../config/api';
import { Recipe } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import CustomButton from '../components/CustomButton';
import RecipeCard from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const handleGenerateRecipes = async () => {
    // Check if API is configured
    if (!isApiConfigured()) {
      Alert.alert(
        'API Not Configured',
        'Please configure your Spoonacular API key in src/config/api.ts to generate recipes.\n\nYou can get a free API key at spoonacular.com/food-api',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    // Reset animation
    fadeAnim.setValue(0);

    try {
      // Get user's ingredients
      const ingredients = await getAllIngredients();

      if (ingredients.length === 0) {
        Alert.alert(
          'No Ingredients',
          'Please add some ingredients to your fridge first!',
          [
            {
              text: 'Add Ingredients',
              onPress: () => navigation.navigate('Fridge' as any),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        setLoading(false);
        return;
      }

      // Extract ingredient names
      const ingredientNames = ingredients.map((ing) => ing.name);

      // Fetch recipes
      const fetchedRecipes = await findRecipesByIngredients(ingredientNames, 10);

      if (fetchedRecipes.length > 0) {
        setRecipes(fetchedRecipes);

        // Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert('No Recipes Found', 'Could not find recipes with your ingredients. Try adding more ingredients!');
      }
    } catch (error: any) {
      console.error('Error generating recipes:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to generate recipes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetRandomRecipes = async () => {
    // Check if API is configured
    if (!isApiConfigured()) {
      Alert.alert(
        'API Not Configured',
        'Please configure your Spoonacular API key in src/config/api.ts to get random recipes.\n\nYou can get a free API key at spoonacular.com/food-api',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    // Reset animation
    fadeAnim.setValue(0);

    try {
      const fetchedRecipes = await getRandomRecipes(10);

      if (fetchedRecipes.length > 0) {
        setRecipes(fetchedRecipes);

        // Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert('No Recipes Found', 'Could not fetch recipes. Please try again later.');
      }
    } catch (error: any) {
      console.error('Error fetching random recipes:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to fetch recipes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  if (loading) {
    return (
      <LoadingSpinner message="Generating delicious recipes for you..." />
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="restaurant-outline"
          title="Find Recipes"
          message="Generate AI-powered recipe suggestions based on your ingredients, or discover random recipes for inspiration!"
          actionLabel="Generate from Fridge"
          onAction={handleGenerateRecipes}
        />
        <View style={styles.alternativeButton}>
          <CustomButton
            title="Get Random Recipes"
            onPress={handleGetRandomRecipes}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {recipes.length} recipe{recipes.length > 1 ? 's' : ''} found
        </Text>
        <View style={styles.headerButtons}>
          <CustomButton
            title="Regenerate"
            onPress={handleGenerateRecipes}
            variant="ghost"
            size="small"
          />
        </View>
      </View>

      {/* Recipes List */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => handleRecipePress(item)}
              showNutrition
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alternativeButton: {
    padding: spacing.lg,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
  },
});

export default RecipesScreen;
