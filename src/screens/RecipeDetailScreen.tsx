import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { addMealHistory, saveRecipe } from '../services/firebaseService';
import { MealType } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../config/theme';
import CustomButton from '../components/CustomButton';
import { formatCookingTime } from '../utils/helpers';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeDetailScreen: React.FC = () => {
  const route = useRoute<RecipeDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { recipe } = route.params;

  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const handleMarkAsCooked = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMealModal(true);
  };

  const handleSaveMeal = async () => {
    setSaving(true);
    try {
      // Save recipe first
      await saveRecipe(recipe);

      // Add to meal history
      await addMealHistory(
        recipe.id,
        recipe,
        selectedMealType,
        new Date(),
        rating > 0 ? rating : undefined,
        notes.trim() || undefined
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Meal logged successfully!', [
        {
          text: 'View History',
          onPress: () => {
            setShowMealModal(false);
            navigation.navigate('MainTabs', { screen: 'History' } as any);
          },
        },
        {
          text: 'OK',
          onPress: () => setShowMealModal(false),
        },
      ]);
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    } finally {
      setSaving(false);
    }
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
    <>
      <ScrollView style={styles.container}>
        {/* Recipe Image */}
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="restaurant" size={80} color={colors.textLight} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.statText}>{formatCookingTime(recipe.cookingTime)}</Text>
            </View>

            <View style={styles.stat}>
              <Ionicons
                name="speedometer-outline"
                size={20}
                color={getDifficultyColor()}
              />
              <Text style={[styles.statText, { color: getDifficultyColor() }]}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Text>
            </View>

            {recipe.servings && (
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.statText}>{recipe.servings} servings</Text>
              </View>
            )}
          </View>

          {/* Nutrition */}
          {(recipe.calories || recipe.protein) && (
            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>Nutrition per serving</Text>
              <View style={styles.nutritionRow}>
                {recipe.calories && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.calories}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                )}
                {recipe.protein && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                )}
                {recipe.carbs && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                )}
                {recipe.fat && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Mark as Cooked Button */}
          <CustomButton
            title="Mark as Cooked"
            onPress={handleMarkAsCooked}
            variant="primary"
            size="large"
            fullWidth
            style={styles.cookButton}
          />
        </View>
      </ScrollView>

      {/* Meal Logging Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Your Meal</Text>

            {/* Meal Type Selection */}
            <Text style={styles.modalLabel}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      selectedMealType === type && styles.mealTypeTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <Text style={styles.modalLabel}>Rating (Optional)</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={colors.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.modalLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How was it? Any changes you made?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.textLight}
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => setShowMealModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <CustomButton
                title="Save"
                onPress={handleSaveMeal}
                loading={saving}
                disabled={saving}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  nutritionContainer: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  nutritionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ingredientText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  cookButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  mealTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  mealTypeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  mealTypeTextActive: {
    color: colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default RecipeDetailScreen;
