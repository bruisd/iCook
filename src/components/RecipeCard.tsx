import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Recipe } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../config/theme';
import { formatCookingTime } from '../utils/helpers';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  showNutrition?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  showNutrition = false,
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Recipe Image */}
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="restaurant" size={48} color={colors.textLight} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.statText}>{formatCookingTime(recipe.cookingTime)}</Text>
            </View>

            <View style={styles.stat}>
              <Ionicons
                name="speedometer-outline"
                size={16}
                color={getDifficultyColor()}
              />
              <Text style={[styles.statText, { color: getDifficultyColor() }]}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Text>
            </View>

            {recipe.servings && (
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.statText}>{recipe.servings} servings</Text>
              </View>
            )}
          </View>

          {/* Nutrition Info (Optional) */}
          {showNutrition && (recipe.calories || recipe.protein) && (
            <View style={styles.nutritionRow}>
              {recipe.calories && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.calories}</Text>
                  <Text style={styles.nutritionLabel}>cal</Text>
                </View>
              )}
              {recipe.protein && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
                  <Text style={styles.nutritionLabel}>protein</Text>
                </View>
              )}
              {recipe.carbs && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>carbs</Text>
                </View>
              )}
              {recipe.fat && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
                  <Text style={styles.nutritionLabel}>fat</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  image: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  nutritionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default RecipeCard;
