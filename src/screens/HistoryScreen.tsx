import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { getMealHistory } from '../services/firebaseService';
import { MealHistory } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import MealHistoryCard from '../components/MealHistoryCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterPeriod = 'all' | 'week' | 'month';

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [meals, setMeals] = useState<MealHistory[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<MealHistory[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeals = async () => {
    try {
      const data = await getMealHistory();
      setMeals(data);
      filterMeals(data, filterPeriod);
    } catch (error) {
      console.error('Error loading meal history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadMeals();
  };

  const filterMeals = (data: MealHistory[], period: FilterPeriod) => {
    if (period === 'all') {
      setFilteredMeals(data);
      return;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      // month
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const filtered = data.filter((meal) => {
      const mealDate = meal.date;
      return mealDate >= startDate && mealDate <= endDate;
    });

    setFilteredMeals(filtered);
  };

  const handleFilterChange = (period: FilterPeriod) => {
    setFilterPeriod(period);
    filterMeals(meals, period);
  };

  const handleMealPress = (meal: MealHistory) => {
    navigation.navigate('RecipeDetail', { recipe: meal.recipe });
  };

  // Group meals by date
  const groupedMeals = filteredMeals.reduce((groups, meal) => {
    const date = format(meal.date, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meal);
    return groups;
  }, {} as Record<string, MealHistory[]>);

  const groupedMealsArray = Object.entries(groupedMeals).map(([date, meals]) => ({
    date,
    displayDate: format(new Date(date), 'EEEE, MMMM d'),
    meals,
  }));

  // Calculate stats
  const totalMeals = filteredMeals.length;
  const totalCalories = filteredMeals.reduce(
    (sum, meal) => sum + (meal.recipe.calories || 0),
    0
  );
  const averageRating =
    filteredMeals.filter((m) => m.rating).length > 0
      ? filteredMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0) /
        filteredMeals.filter((m) => m.rating).length
      : 0;

  if (loading) {
    return <LoadingSpinner message="Loading your meal history..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'week', 'month'] as FilterPeriod[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.filterTab,
              filterPeriod === period && styles.filterTabActive,
            ]}
            onPress={() => handleFilterChange(period)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterPeriod === period && styles.filterTabTextActive,
              ]}
            >
              {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredMeals.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={meals.length === 0 ? "No meals logged yet" : "No meals in this period"}
          message={
            meals.length === 0
              ? "Start cooking and log your meals to track your culinary journey!"
              : "Try changing the time period filter"
          }
          actionLabel={meals.length === 0 ? "Find Recipes" : undefined}
          onAction={
            meals.length === 0
              ? () => navigation.navigate('Recipes' as any)
              : undefined
          }
        />
      ) : (
        <>
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
              <Text style={styles.statValue}>{totalMeals}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="flame" size={20} color={colors.secondary} />
              <Text style={styles.statValue}>{totalCalories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>

            {averageRating > 0 && (
              <View style={styles.statCard}>
                <Ionicons name="star" size={20} color={colors.warning} />
                <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            )}
          </View>

          {/* Meals List */}
          <FlatList
            data={groupedMealsArray}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{item.displayDate}</Text>
                {item.meals.map((meal) => (
                  <MealHistoryCard
                    key={meal.id}
                    mealHistory={meal}
                    onPress={() => handleMealPress(meal)}
                  />
                ))}
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContainer: {
    padding: spacing.md,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});

export default HistoryScreen;
