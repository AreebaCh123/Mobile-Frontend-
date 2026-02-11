import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';
const GOOGLE_CONFIG = Constants.expoConfig?.extra?.google || {};
const isExpoGo = Constants.appOwnership === 'expo';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Let expo-auth-session choose the correct redirect URI for the Expo Auth proxy.
  // This should be https://auth.expo.io/@areebach123/MobileApp when running in Expo Go.
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useIdTokenAuthRequest({
      expoClientId: GOOGLE_CONFIG?.expoClientId,
      iosClientId: GOOGLE_CONFIG?.iosClientId || GOOGLE_CONFIG?.expoClientId,
      androidClientId: GOOGLE_CONFIG?.androidClientId || GOOGLE_CONFIG?.expoClientId,
    });

  useEffect(() => {
    const finishGoogleLogin = async () => {
      if (!googleResponse) return;

      if (googleResponse.type === 'success') {
        const idToken = googleResponse.params?.id_token;
        if (!idToken) {
          Alert.alert('Google Login', 'Could not retrieve Google token. Please try again.');
          setGoogleLoading(false);
          return;
        }

        try {
          setGoogleLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/users/google-auth/mobile/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken }),
          });
          const data = await res.json();
          if (!res.ok) {
            const message =
              typeof data === 'object' && data !== null
                ? Object.values(data)[0]
                : 'Unable to login with Google.';
            Alert.alert('Google Login Failed', Array.isArray(message) ? message.join('\n') : message);
            return;
          }

          const { access } = data?.tokens ?? {};
          const nextUser = data?.user ?? {};
          await AsyncStorage.multiSet([
            ['authToken', access ?? ''],
            ['userProfile', JSON.stringify(nextUser)],
          ]);
          const firstName = nextUser?.first_name;
          Alert.alert(
            'Welcome back!',
            firstName ? `Hi ${firstName}, you're signed in with Google.` : 'Signed in with Google successfully.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  console.log('Google JWT access token:', access);
                  navigation.navigate('Home', { user: nextUser });
                },
              },
            ]
          );
        } catch (error) {
          Alert.alert(
            'Network error',
            'Could not reach the server. Make sure your backend is running and the URL is correct.'
          );
        } finally {
          setGoogleLoading(false);
        }
      } else if (googleResponse.type === 'error') {
        Alert.alert('Google Login', 'Google authentication was cancelled or failed.');
        setGoogleLoading(false);
      }
    };

    finishGoogleLogin();
  }, [googleResponse, navigation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validate form
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('login status:', response.status, data);

      if (!response.ok) {
        const message =
          typeof data === 'object' && data !== null
            ? Object.values(data)[0]
            : 'Unable to login. Please try again.';

        Alert.alert('Login failed', Array.isArray(message) ? message.join('\n') : message);
        return;
      }

      const { access, role, first_name } = data?.data ?? {};
      const loginUser = {
        id: data?.data?.id ?? null,
        username: data?.data?.username ?? formData.email.trim().toLowerCase(),
        email: data?.data?.email ?? formData.email.trim().toLowerCase(),
        first_name: data?.data?.first_name ?? '',
        last_name: data?.data?.last_name ?? '',
        role,
      };
      await AsyncStorage.multiSet([
        ['authToken', access ?? ''],
        ['userProfile', JSON.stringify(loginUser)],
      ]);
      Alert.alert(
        'Success',
        `Welcome back${first_name ? `, ${first_name}` : ''}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('JWT access token:', access);
              navigation.navigate('Home', { user: loginUser });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Network error',
        'Could not reach the server. Make sure your backend is running and the URL is correct.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (googleLoading) return;
    if (!googleRequest) {
      Alert.alert('Google Login', 'Google sign-in is still configuring. Please try again in a moment.');
      return;
    }
    setGoogleLoading(true);
    googlePromptAsync({ useProxy: true, showInRecents: true });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#BF8EEB" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#BF8EEB', '#D4A5F0', '#E8C2F5']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Logo and Branding */}
          <View style={styles.brandingContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
            <Text style={styles.appName}>MindMate</Text>
            <Text style={styles.tagline}>Your journey to mental wellness starts here</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials to continue</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={20} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Email address"
                    placeholderTextColor="#999999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={20} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Password"
                    placeholderTextColor="#999999"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
                {!isLoading && <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.buttonIcon} />}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={googleLoading}
              >
                <Feather name="chrome" size={20} color="#4285F4" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustContainer}>
            <View style={styles.trustItem}>
              <Feather name="shield" size={16} color="#FFFFFF" />
              <Text style={styles.trustText}>Secure & Private</Text>
            </View>
            <View style={styles.trustItem}>
              <Feather name="users" size={16} color="#FFFFFF" />
              <Text style={styles.trustText}>10K+ Users</Text>
            </View>
            <View style={styles.trustItem}>
              <Feather name="star" size={16} color="#FFFFFF" />
              <Text style={styles.trustText}>4.8 Rating</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 18,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D5A27',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 16,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#2D5A27',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#2D5A27',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  signUpText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  signUpLink: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trustText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default LoginScreen;
