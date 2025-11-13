import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { getAllIngredients, deleteIngredient } from '../services/firebaseService';
import { Ingredient, IngredientCategory } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import IngredientCard from '../components/IngredientCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FridgeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories: (IngredientCategory | 'all')[] = [
    'all',
    'dairy',
    'vegetables',
    'meat',
    'fish',
    'fruits',
    'grains',
    'spices',
    'condiments',
    'other',
  ];

  const loadIngredients = async () => {
    try {
      const data = await getAllIngredients();
      setIngredients(data);
      filterIngredients(data, searchQuery, selectedCategory);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      Alert.alert('Error', 'Failed to load ingredients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIngredients();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadIngredients();
  };

  const filterIngredients = (
    data: Ingredient[],
    query: string,
    category: IngredientCategory | 'all'
  ) => {
    let filtered = data;

    if (category !== 'all') {
      filtered = filtered.filter((ing) => ing.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter((ing) =>
        ing.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredIngredients(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterIngredients(ingredients, text, selectedCategory);
  };

  const handleCategoryChange = (category: IngredientCategory | 'all') => {
    setSelectedCategory(category);
    filterIngredients(ingredients, searchQuery, category);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Ingredient',
      'Are you sure you want to delete this ingredient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIngredient(id);
              loadIngredients();
            } catch (error) {
              console.error('Error deleting ingredient:', error);
              Alert.alert('Error', 'Failed to delete ingredient');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (ingredient: Ingredient) => {
    navigation.navigate('AddIngredient', { ingredientId: ingredient.id });
  };

  if (loading) {
    return <LoadingSpinner message="Loading your fridge..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ingredients..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={colors.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryChange(item)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item && styles.categoryChipTextActive,
              ]}
            >
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Ingredients List */}
      {filteredIngredients.length === 0 ? (
        <EmptyState
          icon={ingredients.length === 0 ? "file-tray-outline" : "search-outline"}
          title={ingredients.length === 0 ? "Your fridge is empty" : "No ingredients found"}
          message={
            ingredients.length === 0
              ? "Add ingredients to start generating recipes"
              : "Try adjusting your search or filter"
          }
          actionLabel={ingredients.length === 0 ? "Add Ingredient" : undefined}
          onAction={
            ingredients.length === 0
              ? () => navigation.navigate('AddIngredient', {})
              : undefined
          }
        />
      ) : (
        <FlatList
          data={filteredIngredients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <IngredientCard
              ingredient={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddIngredient', {})}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
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

export default FridgeScreen;
