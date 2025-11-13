import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { signOutUser, getCurrentUser } from '../services/authService';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = getCurrentUser();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.replace('Welcome');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Coming Soon', 'Profile editing will be available soon!');
  };

  const handleEditAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'Avatar editing will be available soon!');
  };

  const handleSavedRecipes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MainTabs', { screen: 'Saved' });
  };

  const handleMealPlans = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MainTabs', { screen: 'Summary' });
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'App settings will be available soon!');
  };

  interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    iconColor: string;
    iconBgColor: string;
    showArrow?: boolean;
    isDestructive?: boolean;
  }

  const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    title,
    onPress,
    iconColor,
    iconBgColor,
    showArrow = true,
    isDestructive = false,
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <Text
          style={[
            styles.menuItemText,
            isDestructive && styles.menuItemTextDestructive,
          ]}
        >
          {title}
        </Text>
      </View>
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="rgba(51, 51, 51, 0.5)"
        />
      )}
    </TouchableOpacity>
  );

  // Get display name or fallback to email
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const displayEmail = currentUser?.email || 'No email';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar with Edit Button */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={64} color={colors.white} />
            </View>
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleEditAvatar}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Name and Email */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation List */}
        <View style={styles.menuList}>
          {/* My Saved Recipes */}
          <MenuItem
            icon="bookmark"
            title="My Saved Recipes"
            onPress={handleSavedRecipes}
            iconColor={colors.primary}
            iconBgColor="rgba(255, 122, 89, 0.2)"
          />

          {/* My Meal Plans */}
          <MenuItem
            icon="calendar"
            title="My Meal Plans"
            onPress={handleMealPlans}
            iconColor={colors.secondary}
            iconBgColor="rgba(76, 175, 80, 0.2)"
          />

          {/* App Settings */}
          <MenuItem
            icon="settings-outline"
            title="App Settings"
            onPress={handleSettings}
            iconColor="rgba(51, 51, 51, 0.8)"
            iconBgColor="rgba(224, 224, 224, 0.5)"
          />

          {/* Log Out */}
          {currentUser && (
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.logoutIconContainer}>
                  <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </View>
                <Text style={styles.logoutText}>Log Out</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: fontSize.md,
    color: 'rgba(51, 51, 51, 0.6)',
    textAlign: 'center',
  },
  editProfileButton: {
    width: '100%',
    maxWidth: 480,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editProfileButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  menuList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 56,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  menuItemTextDestructive: {
    color: '#EF4444',
  },
  logoutItem: {
    marginTop: spacing.lg,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: '#EF4444',
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;
