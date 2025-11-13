import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { getMealHistory } from '../services/firebaseService';
import { MealHistory, MealType } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import LoadingSpinner from '../components/LoadingSpinner';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DayMeals {
  date: Date;
  dayName: string;
  meals: {
    breakfast: MealHistory[];
    lunch: MealHistory[];
    dinner: MealHistory[];
    snack: MealHistory[];
  };
}

interface WeeklyStats {
  recipesLogged: number;
  avgCalories: number;
  frequentIngredient: string;
}

const SummaryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [meals, setMeals] = useState<MealHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('Mon');
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  useFocusEffect(
    useCallback(() => {
      loadWeeklyMeals();
    }, [weekStart])
  );

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  }

  function getEndOfWeek(startDate: Date): Date {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    return end;
  }

  const loadWeeklyMeals = async () => {
    try {
      const weekEnd = getEndOfWeek(weekStart);
      const allMeals = await getMealHistory(weekStart, weekEnd);
      setMeals(allMeals);
    } catch (error) {
      console.error('Error loading weekly meals:', error);
      Alert.alert('Error', 'Failed to load meal history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeeklyMeals();
  };

  const handlePreviousWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
  };

  const handleDayPress = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(day);
  };

  const handleMealPress = (meal: MealHistory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('RecipeDetail', { recipe: meal.recipe });
  };

  const handleAddMeal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const getWeekDateRange = (): string => {
    const weekEnd = getEndOfWeek(weekStart);
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const calculateWeeklyStats = (): WeeklyStats => {
    const recipesLogged = meals.length;

    // Calculate average calories
    const totalCalories = meals.reduce((sum, meal) => {
      return sum + (meal.recipe.calories || 0);
    }, 0);
    const avgCalories = meals.length > 0 ? Math.round(totalCalories / 7) : 0;

    // Find most frequent ingredient
    const ingredientCounts: { [key: string]: number } = {};
    meals.forEach((meal) => {
      meal.recipe.ingredients.forEach((ingredient) => {
        const key = ingredient.toLowerCase();
        ingredientCounts[key] = (ingredientCounts[key] || 0) + 1;
      });
    });

    let frequentIngredient = 'None';
    let maxCount = 0;
    Object.entries(ingredientCounts).forEach(([ingredient, count]) => {
      if (count > maxCount) {
        maxCount = count;
        frequentIngredient = ingredient.split(' ')[0]; // Get first word
        frequentIngredient = frequentIngredient.charAt(0).toUpperCase() + frequentIngredient.slice(1);
      }
    });

    return { recipesLogged, avgCalories, frequentIngredient };
  };

  const groupMealsByDay = (): DayMeals[] => {
    const days: DayMeals[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      const dayMeals = meals.filter((meal) => {
        return meal.date.toDateString() === date.toDateString();
      });

      days.push({
        date,
        dayName: dayNames[i],
        meals: {
          breakfast: dayMeals.filter((m) => m.mealType === 'breakfast'),
          lunch: dayMeals.filter((m) => m.mealType === 'lunch'),
          dinner: dayMeals.filter((m) => m.mealType === 'dinner'),
          snack: dayMeals.filter((m) => m.mealType === 'snack'),
        },
      });
    }

    return days;
  };

  const formatDayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMealRow = (meal: MealHistory) => {
    return (
      <TouchableOpacity
        key={meal.id}
        style={styles.mealRow}
        onPress={() => handleMealPress(meal)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: meal.recipe.imageUrl || 'https://via.placeholder.com/80',
          }}
          style={styles.mealRowImage}
          resizeMode="cover"
        />
        <View style={styles.mealRowInfo}>
          <Text style={styles.mealRowTitle} numberOfLines={1}>
            {meal.recipe.title}
          </Text>
          <Text style={styles.mealRowCalories}>
            {meal.recipe.calories ? `${meal.recipe.calories} calories` : 'No calorie info'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDaySection = (dayData: DayMeals) => {
    const hasMeals =
      dayData.meals.breakfast.length > 0 ||
      dayData.meals.lunch.length > 0 ||
      dayData.meals.dinner.length > 0 ||
      dayData.meals.snack.length > 0;

    return (
      <View key={dayData.dayName} style={styles.daySection}>
        <Text style={styles.daySectionTitle}>{formatDayDate(dayData.date)}</Text>

        {!hasMeals ? (
          <View style={styles.emptyDayCard}>
            <Ionicons name="restaurant-outline" size={40} color="#CCCCCC" />
            <Text style={styles.emptyDayText}>No meals logged for this day.</Text>
            <TouchableOpacity
              style={styles.emptyDayButton}
              onPress={handleAddMeal}
            >
              <Text style={styles.emptyDayButtonText}>Log a Meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mealCards}>
            {dayData.meals.breakfast.length > 0 && (
              <View style={styles.mealCard}>
                <Text style={styles.mealCardTitle}>Breakfast</Text>
                {dayData.meals.breakfast.map(renderMealRow)}
              </View>
            )}
            {dayData.meals.lunch.length > 0 && (
              <View style={styles.mealCard}>
                <Text style={styles.mealCardTitle}>Lunch</Text>
                {dayData.meals.lunch.map(renderMealRow)}
              </View>
            )}
            {dayData.meals.dinner.length > 0 && (
              <View style={styles.mealCard}>
                <Text style={styles.mealCardTitle}>Dinner</Text>
                {dayData.meals.dinner.map(renderMealRow)}
              </View>
            )}
            {dayData.meals.snack.length > 0 && (
              <View style={styles.mealCard}>
                <Text style={styles.mealCardTitle}>Snack</Text>
                {dayData.meals.snack.map(renderMealRow)}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading weekly summary..." />
      </SafeAreaView>
    );
  }

  const stats = calculateWeeklyStats();
  const daysList = groupMealsByDay();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handlePreviousWeek}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextWeek}>
            <Text style={styles.headerDateRange}>{getWeekDateRange()}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Your Weekly Summary</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Day Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayChipsContainer}
          contentContainerStyle={styles.dayChipsContent}
        >
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayChip,
                selectedDay === day && styles.dayChipActive,
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayChipText,
                  selectedDay === day && styles.dayChipTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Key Stats */}
        <Text style={styles.sectionTitle}>Key Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Recipes Logged</Text>
            <Text style={styles.statValue}>{stats.recipesLogged}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Daily Calories</Text>
            <Text style={styles.statValue}>
              {stats.avgCalories.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardWide]}>
            <Text style={styles.statLabel}>Frequent Ingredient</Text>
            <Text style={styles.statValue}>{stats.frequentIngredient}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Daily Summaries */}
        {daysList.map(renderDaySection)}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddMeal}
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
    backgroundColor: '#F8F7F5',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: '#F8F7F5',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.5)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginBottom: spacing.xs,
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDateRange: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  dayChipsContainer: {
    paddingVertical: spacing.md,
  },
  dayChipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dayChip: {
    height: 40,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.8)',
    marginRight: spacing.sm,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  dayChipTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.5)',
  },
  statCardWide: {
    minWidth: '100%',
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(224, 224, 224, 0.5)',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  daySection: {
    marginBottom: spacing.lg,
  },
  daySectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  mealCards: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  mealCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.5)',
    gap: spacing.md,
  },
  mealCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mealRowImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  mealRowInfo: {
    flex: 1,
  },
  mealRowTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  mealRowCalories: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyDayCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(224, 224, 224, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyDayText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyDayButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(244, 140, 37, 0.2)',
  },
  emptyDayButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 92, // Above tab bar (68px) + 24px spacing
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
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

export default SummaryScreen;
