// Utility helper functions
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { IngredientCategory } from '../types';
import { colors } from '../config/theme';

/**
 * Format date for display
 */
export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(date, formatStr);
};

/**
 * Get relative date string (Today, Yesterday, or formatted date)
 */
export const getRelativeDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatDate(date, 'MMM dd');
};

/**
 * Get color for ingredient category
 */
export const getCategoryColor = (category: IngredientCategory): string => {
  switch (category) {
    case 'dairy':
      return colors.dairy;
    case 'vegetables':
      return colors.vegetables;
    case 'meat':
      return colors.meat;
    case 'fish':
      return colors.fish;
    case 'fruits':
      return colors.fruits;
    case 'grains':
      return colors.grains;
    case 'spices':
      return colors.spices;
    case 'condiments':
      return colors.condiments;
    default:
      return colors.other;
  }
};

/**
 * Check if ingredient is expiring soon (within 3 days)
 */
export const isExpiringSoon = (expirationDate?: Date): boolean => {
  if (!expirationDate) return false;
  const daysUntilExpiration = differenceInDays(expirationDate, new Date());
  return daysUntilExpiration >= 0 && daysUntilExpiration <= 3;
};

/**
 * Check if ingredient is expired
 */
export const isExpired = (expirationDate?: Date): boolean => {
  if (!expirationDate) return false;
  return differenceInDays(expirationDate, new Date()) < 0;
};

/**
 * Get expiration status text and color
 */
export const getExpirationStatus = (
  expirationDate?: Date
): { text: string; color: string } => {
  if (!expirationDate) {
    return { text: 'No expiration', color: colors.textLight };
  }

  if (isExpired(expirationDate)) {
    return { text: 'Expired', color: colors.error };
  }

  if (isExpiringSoon(expirationDate)) {
    const days = differenceInDays(expirationDate, new Date());
    return {
      text: days === 0 ? 'Expires today' : `Expires in ${days} day${days > 1 ? 's' : ''}`,
      color: colors.warning,
    };
  }

  const days = differenceInDays(expirationDate, new Date());
  return {
    text: `${days} days left`,
    color: colors.textSecondary,
  };
};

/**
 * Format cooking time (e.g., "30 min", "1 hr 15 min")
 */
export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }

  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate a unique ID (simple implementation)
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
