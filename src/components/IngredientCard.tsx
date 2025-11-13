import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Ingredient } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../config/theme';
import {
  getCategoryColor,
  getExpirationStatus,
  formatDate,
  capitalizeWords,
} from '../utils/helpers';

interface IngredientCardProps {
  ingredient: Ingredient;
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onPress,
  onDelete,
  onEdit,
}) => {
  const scaleAnim = new Animated.Value(1);
  const categoryColor = getCategoryColor(ingredient.category);
  const expirationStatus = getExpirationStatus(ingredient.expirationDate);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onEdit();
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
        {/* Category indicator */}
        <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{capitalizeWords(ingredient.name)}</Text>
              <Text style={styles.quantity}>{ingredient.quantity}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEdit}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="pencil" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDelete}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>
                {capitalizeWords(ingredient.category)}
              </Text>
            </View>

            {ingredient.expirationDate && (
              <View style={styles.expirationContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={expirationStatus.color}
                  style={styles.expirationIcon}
                />
                <Text style={[styles.expirationText, { color: expirationStatus.color }]}>
                  {expirationStatus.text}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  categoryIndicator: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quantity: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expirationIcon: {
    marginRight: spacing.xs,
  },
  expirationText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});

export default IngredientCard;
