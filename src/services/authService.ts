// Firebase Authentication service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    console.log('[Auth] Attempting to create user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('[Auth] User created successfully:', userCredential.user.uid);

    // Update display name if provided
    if (displayName && userCredential.user) {
      console.log('[Auth] Updating display name to:', displayName);
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
      console.log('[Auth] Display name updated successfully');
    }

    return userCredential.user;
  } catch (error: any) {
    console.error('[Auth] Sign up error:', {
      code: error.code,
      message: error.message,
      details: error,
    });
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    console.log('[Auth] Attempting to sign in with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('[Auth] Sign in successful:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('[Auth] Sign in error:', {
      code: error.code,
      message: error.message,
      details: error,
    });
    throw error;
  }
};

/**
 * Sign in with Google
 * Note: signInWithPopup doesn't work in React Native (web-only API)
 * For production mobile apps, you need to use @react-native-google-signin/google-signin or expo-auth-session
 */
export const signInWithGoogle = async (): Promise<User> => {
  throw new Error(
    'Google Sign-In is not configured for React Native. ' +
    'This feature requires @react-native-google-signin/google-signin or expo-auth-session. ' +
    'Please use email/password authentication instead.'
  );
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
