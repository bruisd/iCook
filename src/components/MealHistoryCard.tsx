import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MealHistory } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../config/theme';
import { formatCookingTime, getRelativeDate } from '../utils/helpers';

interface MealHistoryCardProps {
  mealHistory: MealHistory;
  onPress?: () => void;
}

const MealHistoryCard: React.FC<MealHistoryCardProps> = ({
  mealHistory,
  onPress,
}) => {
  const getMealTypeIcon = () => {
    switch (mealHistory.mealType) {
      case 'breakfast':
        return 'sunny-outline';
      case 'lunch':
        return 'restaurant-outline';
      case 'dinner':
        return 'moon-outline';
      case 'snack':
        return 'nutrition-outline';
      default:
        return 'fast-food-outline';
    }
  };

  const getMealTypeColor = () => {
    switch (mealHistory.mealType) {
      case 'breakfast':
        return colors.warning;
      case 'lunch':
        return colors.primary;
      case 'dinner':
        return colors.primaryDark;
      case 'snack':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Meal Type Indicator */}
      <View
        style={[
          styles.mealTypeIndicator,
          { backgroundColor: getMealTypeColor() },
        ]}
      >
        <Ionicons name={getMealTypeIcon()} size={24} color={colors.white} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.mealType}>
              {mealHistory.mealType.charAt(0).toUpperCase() +
                mealHistory.mealType.slice(1)}
            </Text>
            <Text style={styles.date}>{getRelativeDate(mealHistory.date)}</Text>
          </View>

          {mealHistory.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={styles.ratingText}>{mealHistory.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {mealHistory.recipe.title}
        </Text>

        {mealHistory.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {mealHistory.notes}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {formatCookingTime(mealHistory.recipe.cookingTime)}
            </Text>
          </View>

          {mealHistory.recipe.calories && (
            <View style={styles.stat}>
              <Ionicons name="flame-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{mealHistory.recipe.calories} cal</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recipe Image */}
      {mealHistory.recipe.imageUrl && (
        <Image
          source={{ uri: mealHistory.recipe.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.small,
  },
  mealTypeIndicator: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flex: 1,
  },
  mealType: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  image: {
    width: 80,
    height: '100%',
  },
});

export default MealHistoryCard;
