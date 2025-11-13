import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "../navigation/types";
import {
  getAllIngredients,
  deleteIngredient,
  addIngredient,
} from "../services/firebaseService";
import { Ingredient } from "../types";
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from "../config/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const COMMON_INGREDIENTS = ["Milk", "Chicken", "Onions", "Garlic", "Tomatoes"];

const NewHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadIngredients();
    }, [])
  );

  const loadIngredients = async () => {
    try {
      const allIngredients = await getAllIngredients();
      setIngredients(allIngredients);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    }
  };

  const handleAddIngredient = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await addIngredient({
        name: searchQuery.trim(),
        quantity: "1",
        category: "other",
      });

      await loadIngredients();
      setSearchQuery("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      Alert.alert("Error", "Failed to add ingredient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (ingredientName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await addIngredient({
        name: ingredientName,
        quantity: "1",
        category: "other",
      });

      await loadIngredients();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AddIngredient", { ingredientId: ingredient.id });
  };

  const handleDeleteIngredient = (ingredient: Ingredient) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "Delete Ingredient",
      `Remove "${ingredient.name}" from your fridge?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIngredient(ingredient.id);
              await loadIngredients();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error("Error deleting ingredient:", error);
              Alert.alert("Error", "Failed to delete ingredient.");
            }
          },
        },
      ]
    );
  };

  const handleGenerateRecipes = () => {
    if (ingredients.length === 0) {
      Alert.alert(
        "No Ingredients",
        "Please add some ingredients from your fridge first."
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ingredientNames = ingredients.map((ing) => ing.name);
    navigation.navigate("RecipesResults", { ingredients: ingredientNames });
  };

  const renderIngredientCard = ({ item }: { item: Ingredient }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <Text style={styles.ingredientQuantity}>{item.quantity}</Text>
      </View>
      <View style={styles.ingredientActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditIngredient(item)}
          activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={20} color="#888888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteIngredient(item)}
          activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color="#888888" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Background */}
      <ImageBackground
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaywoWhbVx_WTr09U7eZjuXc0HbBLcUSac75l1NaDBjJwQw9KsagOBjsYTuwVJPGZ9tQRtXY-ZHQB6BXWIaD4v4Qcf65T0TBqtDCPYXx4fGcIU0km-uBTvT1KWhwiuRh28epb1MXeECm8NdjP0OOq9_XoGuEPRYDa9VQnNEkSs0WbiM36yGNg8MwnXednKL6cjoDw6tFzQhQJXaFwgAFYJmtxPTpoXNSoetP2BH4g_ATQVjkGg0WKrGSNiMNQ9Amdbo_uYWHH7yIb-",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}>
        <LinearGradient
          colors={[
            "rgba(247, 245, 242, 0)",
            "rgba(247, 245, 242, 0.8)",
            "rgba(247, 245, 242, 1)",
          ]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="restaurant-outline" size={28} color={colors.text} />
          <Text style={styles.title}>What's in your fridge?</Text>
        </View>

        {/* Search Bar with Add Button */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#888888"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="e.g., penne pasta"
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddIngredient}
            disabled={loading || !searchQuery.trim()}
            activeOpacity={0.8}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Ingredients List */}
        {ingredients.length > 0 && (
          <View style={styles.ingredientsListContainer}>
            <FlatList
              data={ingredients}
              keyExtractor={(item) => item.id}
              renderItem={renderIngredientCard}
              scrollEnabled={false}
              contentContainerStyle={styles.ingredientsList}
            />
          </View>
        )}

        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Or add common ingredients</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}>
            {COMMON_INGREDIENTS.map((ingredient) => (
              <TouchableOpacity
                key={ingredient}
                style={styles.chip}
                onPress={() => handleQuickAdd(ingredient)}
                activeOpacity={0.7}>
                <Text style={styles.chipText}>{ingredient}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* Generate Recipes Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateRecipes}
          activeOpacity={0.8}>
          <Text style={styles.generateButtonText}>Generate Recipes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F2",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImageStyle: {
    opacity: 0.1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  searchBar: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(224, 224, 224, 0.6)",
    borderRadius: borderRadius.full,
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ingredientsListContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  ingredientsList: {
    gap: spacing.sm,
  },
  ingredientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  ingredientQuantity: {
    fontSize: fontSize.sm,
    color: "#888888",
  },
  ingredientActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  quickAddSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: "rgba(51, 51, 51, 0.8)",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  chipsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 85,
    backgroundColor: "rgba(247, 245, 242, 0.8)",
  },
  generateButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  generateButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.24,
  },
});

export default NewHomeScreen;
