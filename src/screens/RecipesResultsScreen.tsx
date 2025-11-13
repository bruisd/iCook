import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { findRecipesByIngredients } from '../services/recipeService';
import { saveRecipe, getSavedRecipes } from '../services/firebaseService';
import { isApiConfigured } from '../config/api';
import { Recipe } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCookingTime } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RecipesResultsRouteProp = RouteProp<RootStackParamList, 'RecipesResults'>;

const RecipesResultsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecipesResultsRouteProp>();
  const { ingredients } = route.params;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    generateRecipes();
    loadSavedRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, recipes]);

  const loadSavedRecipes = async () => {
    try {
      const saved = await getSavedRecipes();
      // Store external IDs (Spoonacular IDs) for comparison
      const externalIds = saved
        .filter((r) => r.externalId)
        .map((r) => r.externalId!);
      setSavedRecipeIds(new Set(externalIds));
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  };

  const filterRecipes = () => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(recipes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.difficulty.toLowerCase().includes(query)
    );
    setFilteredRecipes(filtered);
  };

  const generateRecipes = async () => {
    if (!isApiConfigured()) {
      Alert.alert(
        'API Not Configured',
        'Please configure your Spoonacular API key in src/config/api.ts to generate recipes.\n\nYou can get a free API key at spoonacular.com/food-api',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    setLoading(true);

    try {
      const fetchedRecipes = await findRecipesByIngredients(ingredients, 10);
      setRecipes(fetchedRecipes);
      setFilteredRecipes(fetchedRecipes);

      if (fetchedRecipes.length === 0) {
        Alert.alert(
          'No Recipes Found',
          'Could not find recipes with your ingredients. Try adding more ingredients!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      console.error('Error generating recipes:', error);

      // Provide helpful error messages based on error type
      let errorTitle = 'Error';
      let errorMessage = error.message || 'Failed to generate recipes. Please try again.';

      if (error.message?.includes('API quota exceeded')) {
        errorTitle = 'API Limit Reached';
        errorMessage =
          'You have reached your daily API limit for recipe generation.\n\n' +
          'Please try again tomorrow or upgrade your Spoonacular API plan at spoonacular.com/food-api/pricing';
      } else if (error.message?.includes('Invalid API key')) {
        errorTitle = 'API Configuration Error';
        errorMessage =
          'Your Spoonacular API key is invalid.\n\n' +
          'Please check your API configuration in src/config/api.ts';
      } else if (error.message?.includes('Network Error')) {
        errorTitle = 'No Internet Connection';
        errorMessage =
          'Please check your internet connection and try again.';
      }

      Alert.alert(
        errorTitle,
        errorMessage,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Use externalId for comparison since that's what we track
    const recipeExternalId = recipe.externalId || recipe.id;
    const isSaved = savedRecipeIds.has(recipeExternalId);

    try {
      if (isSaved) {
        // Remove from saved (implement delete if needed)
        setSavedRecipeIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recipeExternalId);
          return newSet;
        });
        Alert.alert('Removed', 'Recipe removed from saved recipes');
      } else {
        // Save recipe
        await saveRecipe(recipe);
        setSavedRecipeIds((prev) => new Set(prev).add(recipeExternalId));
        Alert.alert('Saved', 'Recipe saved successfully!');
      }
    } catch (error) {
      console.error('Error bookmarking recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleAddIngredients = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Generating delicious recipes for you..." />
      </SafeAreaView>
    );
  }

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const recipeExternalId = item.externalId || item.id;
    const isSaved = savedRecipeIds.has(recipeExternalId);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleRecipePress(item)}
        activeOpacity={0.9}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x225' }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          {/* Bookmark Button */}
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => handleBookmark(item)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#285C2D" />
              <Text style={styles.metaText}>{formatCookingTime(item.cookingTime)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={18} color="#285C2D" />
              <Text style={styles.metaText}>
                {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generated Recipes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Refine by cuisine, diet, etc."
            placeholderTextColor="rgba(51, 51, 51, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Recipes List */}
      {filteredRecipes.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title={searchQuery ? 'No Recipes Found' : 'No Recipes Generated'}
          message={
            searchQuery
              ? 'Try adjusting your search filter'
              : 'Try adding different ingredients to find more recipes'
          }
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={renderRecipeCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddIngredients}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(247, 245, 242, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F7F5F2',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.5)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(247, 245, 242, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  recipeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: 'rgba(51, 51, 51, 0.8)',
  },
  fab: {
    position: 'absolute',
    bottom: 92, // Above tab bar (68px) + 24px spacing
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default RecipesResultsScreen;
