import React, { useState, useContext } from 'react';
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
import Constants from 'expo-constants';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';


// ✅ MOVED OUTSIDE (IMPORTANT FIX)
const FormInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  secureTextEntry = false
}) => (
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


const SignUpScreen = ({ navigation }) => {

  // ✅ useState declarations
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    reason: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const { isDark } = useContext(ThemeContext);

  const bgColor = isDark ? '#050509' : '#F8F9FA';
  const headerBg = isDark ? '#050509' : '#FFFFFF';
  const headerText = isDark ? '#FFFFFF' : '#000000';


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSignUp = async () => {
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
        Alert.alert('Signup failed');
        return;
      }

      // Pass user to ProfileSetup (it needs `route.params.user.id`)
      const user = data?.user ?? data?.user_profile ?? data?.profile?.user ?? data;
      navigation.replace('ProfileSetup', { user });

    } catch (error) {
      Alert.alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

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
            secureTextEntry
          />

          <FormInput
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Confirm Password"
            secureTextEntry
          />

          <FormInput
            value={formData.gender}
            onChangeText={(value) => handleInputChange('gender', value)}
            placeholder="Gender"
          />

          <FormInput
            value={formData.reason}
            onChangeText={(value) => handleInputChange('reason', value)}
            placeholder="Why are you using this app?"
            multiline
          />

        </View>
      </ScrollView>

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
      </View>

    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  formContainer: { padding: 20 },
  inputContainer: { marginBottom: 16 },
  textInput: {
    backgroundColor: '#F0E6FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 20,
  },
  signUpButton: {
    backgroundColor: '#2D5A27',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpScreen;
