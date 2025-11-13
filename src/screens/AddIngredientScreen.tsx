import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/types';
import { addIngredient, updateIngredient, getIngredientById } from '../services/firebaseService';
import { Ingredient, IngredientCategory } from '../types';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../config/theme';
import CustomButton from '../components/CustomButton';
import { getCategoryColor } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddIngredient'>;
type AddIngredientRouteProp = RouteProp<RootStackParamList, 'AddIngredient'>;

const AddIngredientScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddIngredientRouteProp>();
  const ingredientId = route.params?.ingredientId;

  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(!!ingredientId);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('other');
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadIngredient = async () => {
      if (ingredientId) {
        try {
          const ingredient = await getIngredientById(ingredientId);
          if (ingredient) {
            setEditingIngredient(ingredient);
            setName(ingredient.name);
            setQuantity(ingredient.quantity);
            setCategory(ingredient.category);
            setExpirationDate(ingredient.expirationDate);
          } else {
            Alert.alert('Error', 'Ingredient not found');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Error loading ingredient:', error);
          Alert.alert('Error', 'Failed to load ingredient');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      }
    };

    loadIngredient();
  }, [ingredientId]);

  const categories: IngredientCategory[] = [
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }

    setSaving(true);

    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, {
          name: name.trim(),
          quantity: quantity.trim(),
          category,
          expirationDate,
        });
      } else {
        await addIngredient({
          name: name.trim(),
          quantity: quantity.trim(),
          category,
          expirationDate,
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      Alert.alert('Error', 'Failed to save ingredient');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading ingredient..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Name Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ingredient Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Milk, Tomatoes, Chicken..."
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Quantity Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500g, 2 pieces, 1 liter..."
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor:
                      category === cat ? getCategoryColor(cat) : colors.white,
                    borderColor:
                      category === cat ? getCategoryColor(cat) : colors.border,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat && styles.categoryOptionTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Expiration Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Expiration Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateButtonText}>
              {expirationDate
                ? expirationDate.toLocaleDateString()
                : 'Select date'}
            </Text>
            {expirationDate && (
              <TouchableOpacity
                onPress={() => setExpirationDate(undefined)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={expirationDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Save Button */}
        <CustomButton
          title={editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          variant="primary"
          size="large"
          fullWidth
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  content: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  categoryOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  categoryOptionTextActive: {
    fontWeight: fontWeight.bold,
  },
  dateButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});

export default AddIngredientScreen;
