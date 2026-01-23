import React, { useEffect, useState, useContext } from 'react';
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
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';
const GOOGLE_CONFIG = Constants.expoConfig?.extra?.google || {};
const isExpoGo = Constants.appOwnership === 'expo';

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : '#F8F9FA';
  const headerBg = isDark ? '#050509' : '#FFFFFF';
  const headerText = isDark ? '#FFFFFF' : '#000000';

  const redirectUri = makeRedirectUri({ useProxy: true });

  const googleRequestConfig = {
    expoClientId: GOOGLE_CONFIG?.expoClientId,
    redirectUri,
  };

  if (GOOGLE_CONFIG?.androidClientId) {
    googleRequestConfig.androidClientId = GOOGLE_CONFIG.androidClientId;
  }
  if (GOOGLE_CONFIG?.iosClientId) {
    googleRequestConfig.iosClientId = GOOGLE_CONFIG.iosClientId;
  }

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleRequestConfig);

  useEffect(() => {
    const completeGoogleSignup = async () => {
      if (!response) return;

      if (response.type === 'success') {
        const idToken = response.params?.id_token;
        if (!idToken) {
          Alert.alert('Google Sign Up', 'Could not retrieve Google token. Please try again.');
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
            const errorMessage =
              typeof data === 'object' && data !== null
                ? Object.values(data)[0]
                : 'Unable to complete Google sign up.';
            Alert.alert('Google Sign Up Failed', Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage);
            return;
          }

          const isNewUser = data?.is_new_user;
          const nextUser = data?.user ?? {};
          const tokens = data?.tokens ?? {};
          await AsyncStorage.multiSet([
            ['authToken', tokens?.access ?? ''],
            ['userProfile', JSON.stringify(nextUser)],
          ]);
          Alert.alert(
            'Welcome!',
            isNewUser ? 'Your account has been created with Google.' : 'Signed in with Google successfully.',
            [
              {
                text: 'Continue',
                onPress: () =>
                  isNewUser
                    ? navigation.navigate('ProfileSetup', { user: nextUser })
                    : navigation.navigate('Home', { user: nextUser }),
              },
            ]
          );
        } catch (err) {
          Alert.alert(
            'Network error',
            'Could not reach the server. Make sure your backend is running and the URL is correct.'
          );
        } finally {
          setGoogleLoading(false);
        }
      } else if (response.type === 'error') {
        Alert.alert('Google Sign Up', 'Google authentication was cancelled or failed.');
        setGoogleLoading(false);
      }
    };

    completeGoogleSignup();
  }, [response, navigation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        gender: formData.gender.trim(),
        reason_for_app_use: formData.reason.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/users/signup/mobile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const firstError =
          typeof data === 'object' && data !== null
            ? Object.values(data)[0]
            : 'Unable to create account. Please try again.';

        Alert.alert('Signup failed', Array.isArray(firstError) ? firstError.join('\n') : firstError);
        return;
      }

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ProfileSetup', { user: data?.user }),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Network error',
        'Could not reach the server. Make sure your backend is running and the URL is correct.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    if (googleLoading) return;
    if (!request) {
      Alert.alert('Google Sign Up', 'Google sign-in is still configuring. Please try again in a moment.');
      return;
    }
    setGoogleLoading(true);
    promptAsync({ useProxy: true, showInRecents: true });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: headerText }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: headerText }]}>Sign Up</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <FormInput
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Name"
          />

          <FormInput
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Email"
            keyboardType="email-address"
          />

          <FormInput
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Password"
            secureTextEntry={true}
          />

          <FormInput
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Confirm Password"
            secureTextEntry={true}
          />

          {/* Gender Selection */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.textInput, { justifyContent: 'center' }]}
              onPress={() => setGenderModalVisible(!genderModalVisible)}
            >
              <Text style={{
                color: formData.gender ? '#000000' : '#999999',
                fontSize: 16
              }}>
                {formData.gender || "Gender"}
              </Text>
              <Text style={{ position: 'absolute', right: 15, color: '#999999' }}>▼</Text>
            </TouchableOpacity>

            {genderModalVisible && (
              <View style={styles.dropdownList}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('gender', option);
                      setGenderModalVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <FormInput
            value={formData.reason}
            onChangeText={(value) => handleInputChange('reason', value)}
            placeholder="Why are you using this app?"
            multiline={true}
          />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.signUpButtonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignUp}
          disabled={googleLoading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>
            {googleLoading ? 'Connecting...' : 'Sign up with Google'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, secureTextEntry = false }) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={[styles.textInput, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999999"
      keyboardType={keyboardType}
      autoCapitalize={multiline ? 'sentences' : 'words'}
      autoCorrect={false}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F0E6FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownList: {
    marginTop: 5,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  signUpButton: {
    backgroundColor: '#2D5A27',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#2D5A27',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SignUpScreen;
