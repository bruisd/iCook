import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleCreateAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXkKNdp36YvL7DVsEBmHmf_oMI2VaRQhLEdLhJJDjctRp-jbQx6QXhwMrBj9jhk9SkZCaqh4304LbTXb3q_tRqMqAkMDpej0TO3ZU4RpXVpSD4-nvD8FgBQHbuusuc6ycob22aMqz6SyDsGGt9mWkFDvzzZO7qDX_kowAg9O47aXaglo5rrAAYFv3iXZDoP7a78tfBJ9ON3YWKSbrox4HeDUj9bctTBS4t5sd5zflCmz1A3D-otckWtyEAVa8eum2gyCW3_ZcLbMRe',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Gradient Scrim Overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
        locations={[0, 0.6, 1]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Top Spacer */}
          <View style={styles.spacerTop} />

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>iCook</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Your next favorite recipe awaits</Text>

          {/* Bottom Spacer */}
          <View style={styles.spacerBottom} />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacerTop: {
    flex: 2,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F7F7F7',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 36,
  },
  spacerBottom: {
    flex: 2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#FF7A59',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.24,
  },
  secondaryButton: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.24,
  },
});

export default WelcomeScreen;
