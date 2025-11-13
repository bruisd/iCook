import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { signUpWithEmail, signInWithGoogle } from '../services/authService';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signUpWithEmail(email, password, name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('MainTabs') },
      ]);
    } catch (error: any) {
      console.error('Sign up error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }

      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signInWithGoogle();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('Google sign up error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error.code !== 'auth/popup-closed-by-user') {
        Alert.alert('Sign Up Failed', 'Failed to sign up with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6JOdFqO4ghTZBy95bR5TEeQE9rKp4QtnRJ8V1NlnTHHsUXloE8RxwxorvCB1xIgdhdUKlM0G1caRjSTSVJu1efzn1RKqH4uSom-2PSBjQKZg3npv9KTx5dZ9_F0CFV-Nuvyxo21XbIo_w0EUQYhHh80FqreVdSzSgRZjlRcWUSLOY3pjwxzBBiisThE4DOrBDYaJvq4B0-sLLtqnm-RJF3Zr6KUYJ9ncrRrzWfnKibBzkLBkYU8epj0XV0yJ-UpUOU2bh__Fchdo7',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Dark Overlay */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>iCook</Text>
              <Text style={styles.tagline}>Join us and discover amazing recipes.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="rgba(51, 51, 51, 0.6)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(51, 51, 51, 0.5)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="rgba(51, 51, 51, 0.6)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    placeholderTextColor="rgba(51, 51, 51, 0.5)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="rgba(51, 51, 51, 0.6)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password (min. 6 characters)"
                    placeholderTextColor="rgba(51, 51, 51, 0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="rgba(51, 51, 51, 0.6)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="rgba(51, 51, 51, 0.6)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(51, 51, 51, 0.5)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="rgba(51, 51, 51, 0.6)"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Google Sign In - Disabled for React Native (requires additional setup) */}
              {/*
              <TouchableOpacity
                style={[styles.googleButton, loading && styles.buttonDisabled]}
                onPress={handleGoogleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={24} color={colors.text} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              */}
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#F8F8F8',
    borderRadius: borderRadius.md,
    paddingLeft: 48,
    paddingRight: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: spacing.xs,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  signUpButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  googleButton: {
    height: 56,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleIcon: {
    marginRight: spacing.sm,
  },
  googleButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginLink: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});

export default SignUpScreen;
