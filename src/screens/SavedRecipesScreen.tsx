import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { getSavedRecipes, deleteRecipe } from '../services/firebaseService';
import { Recipe } from '../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCookingTime } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SavedRecipesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedRecipes = async () => {
    try {
      const saved = await getSavedRecipes();
      setRecipes(saved);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedRecipes();
  };

  const handleRecipePress = (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleUnsave = (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Remove Recipe',
      `Remove "${recipe.title}" from saved recipes?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipe.id);

              // Update local state to remove the recipe
              setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error unsaving recipe:', error);
              Alert.alert('Error', 'Failed to remove recipe. Please try again.');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x225' }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        {/* Bookmark Button */}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => handleUnsave(item)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="bookmark"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading saved recipes..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        <Text style={styles.headerSubtitle}>
          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {recipes.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="No Saved Recipes Yet"
          message="Start saving your favorite recipes to see them here"
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderRecipeCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
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
});

export default SavedRecipesScreen;
