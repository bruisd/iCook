import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { getAllIngredients } from "../services/firebaseService";
import { getMealHistory } from "../services/firebaseService";
import { Ingredient, MealHistory } from "../types";
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from "../config/theme";
import CustomButton from "../components/CustomButton";
import LoadingSpinner from "../components/LoadingSpinner";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recentMeals, setRecentMeals] = useState<MealHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [ingredientsData, mealsData] = await Promise.all([
        getAllIngredients(),
        getMealHistory(),
      ]);
      setIngredients(ingredientsData);
      setRecentMeals(mealsData.slice(0, 3));
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your kitchen..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>Welcome to iCook!</Text>
        <Text style={styles.subtitle}>
          Let's cook something delicious today
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Fridge" as any)}>
            <Ionicons name="file-tray-full" size={32} color={colors.white} />
            <Text style={styles.actionTitle}>My Fridge</Text>
            <Text style={styles.actionSubtitle}>
              {ingredients.length} items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate("Recipes" as any)}>
            <Ionicons name="restaurant" size={32} color={colors.white} />
            <Text style={styles.actionTitle}>Find Recipes</Text>
            <Text style={styles.actionSubtitle}>AI-powered</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Kitchen Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons
              name="file-tray-full-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.statValue}>{ingredients.length}</Text>
            <Text style={styles.statLabel}>Ingredients</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.statValue}>{recentMeals.length}</Text>
            <Text style={styles.statLabel}>Recent Meals</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={24} color={colors.warning} />
            <Text style={styles.statValue}>
              {recentMeals.reduce(
                (sum, meal) => sum + (meal.recipe.calories || 0),
                0
              )}
            </Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      {/* Recent Meals */}
      {recentMeals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Meals</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("History" as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentMeals.map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealTitle} numberOfLines={1}>
                  {meal.recipe.title}
                </Text>
                <Text style={styles.mealMeta}>
                  {meal.mealType} • {meal.date.toLocaleDateString()}
                </Text>
              </View>
              {meal.rating && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.ratingText}>{meal.rating}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Call to Action */}
      <View style={styles.section}>
        <View style={styles.ctaCard}>
          <Ionicons name="bulb" size={48} color={colors.primary} />
          <Text style={styles.ctaTitle}>Not sure what to cook?</Text>
          <Text style={styles.ctaText}>
            Let AI suggest recipes based on your ingredients
          </Text>
          <CustomButton
            title="Generate Recipes"
            onPress={() => navigation.navigate("Recipes" as any)}
            variant="primary"
            style={styles.ctaButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  hero: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    ...shadows.small,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mealItem: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadows.small,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mealMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
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
  ctaCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  ctaText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  ctaButton: {
    minWidth: 200,
  },
});

export default HomeScreen;
