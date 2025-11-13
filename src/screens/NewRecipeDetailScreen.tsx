import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { getAllIngredients, addMealHistory, saveRecipe } from '../services/firebaseService';
import { Ingredient } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import { formatCookingTime } from '../utils/helpers';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'ingredients' | 'instructions';

const NewRecipeDetailScreen: React.FC = () => {
  const route = useRoute<RecipeDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { recipe } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [userIngredients, setUserIngredients] = useState<string[]>([]);

  useEffect(() => {
    loadUserIngredients();
  }, []);

  const loadUserIngredients = async () => {
    try {
      const ingredients = await getAllIngredients();
      const ingredientNames = ingredients.map((ing) => ing.name.toLowerCase());
      setUserIngredients(ingredientNames);
    } catch (error) {
      console.error('Error loading user ingredients:', error);
    }
  };

  const isIngredientInPantry = (ingredient: string): boolean => {
    const ingredientLower = ingredient.toLowerCase();
    return userIngredients.some((userIng) =>
      ingredientLower.includes(userIng) || userIng.includes(ingredientLower)
    );
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\nCooking Time: ${formatCookingTime(recipe.cookingTime)}\nDifficulty: ${recipe.difficulty}`,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const handleLogMeal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Log This Meal',
      'What meal is this for?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Breakfast',
          onPress: () => logMeal('breakfast'),
        },
        {
          text: 'Lunch',
          onPress: () => logMeal('lunch'),
        },
        {
          text: 'Dinner',
          onPress: () => logMeal('dinner'),
        },
        {
          text: 'Snack',
          onPress: () => logMeal('snack'),
        },
      ],
      { cancelable: true }
    );
  };

  const logMeal = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      // Save recipe first and get the Firebase document ID
      const savedRecipeId = await saveRecipe(recipe);

      // Add to meal history with the Firebase recipe ID
      await addMealHistory(savedRecipeId, recipe, mealType, new Date());

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to Summary screen to show logged meal
      Alert.alert(
        'Success',
        'Meal logged successfully!',
        [
          {
            text: 'View Summary',
            onPress: () => {
              navigation.navigate('MainTabs', { screen: 'Summary' });
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    }
  };

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          onPress={handleShare}
          style={styles.headerButton}
        >
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/400x320' }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        </View>

        {/* Recipe Title */}
        <Text style={styles.title}>{recipe.title}</Text>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statText}>{formatCookingTime(recipe.cookingTime)}</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statText}>
              {recipe.servings ? `${recipe.servings} servings` : 'N/A'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="speedometer-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statText}>
              {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Segmented Control */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]}
              onPress={() => handleTabChange('ingredients')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'ingredients' && styles.tabTextActive,
                ]}
              >
                Ingredients
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'instructions' && styles.tabActive]}
              onPress={() => handleTabChange('instructions')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'instructions' && styles.tabTextActive,
                ]}
              >
                Instructions
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {activeTab === 'ingredients' ? (
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => {
              const inPantry = isIngredientInPantry(ingredient);
              return (
                <View
                  key={index}
                  style={[
                    styles.ingredientItem,
                    inPantry && styles.ingredientItemInPantry,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      inPantry && styles.checkboxChecked,
                    ]}
                  >
                    {inPantry && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                  </View>
                  <View style={styles.ingredientContent}>
                    <Text style={styles.ingredientName}>{ingredient}</Text>
                  </View>
                  {inPantry && (
                    <Text style={styles.inPantryLabel}>In Pantry</Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logButton}
          onPress={handleLogMeal}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-done-outline" size={24} color={colors.white} />
          <Text style={styles.logButtonText}>Log this Meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(248, 247, 245, 0.8)',
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  recipeImage: {
    width: '100%',
    height: 320,
    borderRadius: borderRadius.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    width: 80,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(244, 140, 37, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: borderRadius.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: '#F8F7F5',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#888888',
  },
  tabTextActive: {
    color: colors.primary,
  },
  ingredientsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: '#F0F0F0',
  },
  ingredientItemInPantry: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  inPantryLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#4CAF50',
  },
  instructionsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  instructionNumberText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 24, // 24px above tab bar
    backgroundColor: '#F8F7F5',
  },
  logButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});

export default NewRecipeDetailScreen;
