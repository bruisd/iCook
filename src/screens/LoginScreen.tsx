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
import { signInWithEmail, signInWithGoogle } from '../services/authService';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signInWithEmail(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigation will be handled by auth state listener
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = 'Failed to log in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signInWithGoogle();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('Google login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error.code !== 'auth/popup-closed-by-user') {
        Alert.alert('Login Failed', 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement forgot password
    Alert.alert('Forgot Password', 'Password reset feature coming soon!');
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SignUp');
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
              <Text style={styles.tagline}>Your culinary adventure starts here.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
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
                    placeholder="Enter your password"
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

              {/* Forgot Password */}
              <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </TouchableOpacity>

              {/* Google Sign In - Disabled for React Native (requires additional setup) */}
              {/*
              <TouchableOpacity
                style={[styles.googleButton, loading && styles.buttonDisabled]}
                onPress={handleGoogleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={24} color={colors.text} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              */}
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
  forgotPassword: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  loginButton: {
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
  loginButtonText: {
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signUpText: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signUpLink: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});

export default LoginScreen;
