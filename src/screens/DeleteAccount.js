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
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

const DeleteAccount = ({ navigation }) => {
  const [formData, setFormData] = useState({
    password: '',
    reason: '',
    confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : '#F5F5F5';
  const headerBg = isDark ? '#050509' : '#FFFFFF';
  const headerText = isDark ? '#FFFFFF' : '#000000';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteAccount = async () => {
    // Validate form
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    if (!formData.reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for deletion');
      return;
    }
    
    if (formData.confirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type "DELETE" to confirm account deletion');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        Alert.alert('Session expired', 'Please log in again.');
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/account/delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.password,
          reason: formData.reason,
          confirmation: formData.confirmation,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let message = 'Unable to delete account. Please try again.';
        if (data && typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            message = Array.isArray(data[firstKey])
              ? data[firstKey][0]
              : String(data[firstKey]);
          }
        }
        throw new Error(message);
      }

      await AsyncStorage.clear();

      Alert.alert(
        'Account Deleted',
        'Your account and all data have been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
            },
          },
        ]
      );
    } catch (error) {
      console.log('Delete account error:', error);
      Alert.alert('Error', error.message || 'Unable to delete account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBg} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: '#F0F0F0' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: headerText }]}>Delete Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <Feather name="alert-triangle" size={32} color="#EF4444" />
          <Text style={styles.warningTitle}>Warning: This action cannot be undone</Text>
          <Text style={styles.warningText}>
            Deleting your account will permanently remove all your data, including:
          </Text>
          <Text style={styles.warningList}>• Your profile information</Text>
          <Text style={styles.warningList}>• Journal entries and mood tracking data</Text>
          <Text style={styles.warningList}>• Task and medication reminders</Text>
          <Text style={styles.warningList}>• All app preferences and settings</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.textInput}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your current password"
              placeholderTextColor="#999999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Reason Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reason for Deletion</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.reason}
              onChangeText={(value) => handleInputChange('reason', value)}
              placeholder="Please tell us why you're deleting your account..."
              placeholderTextColor="#999999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Confirmation Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
            <TextInput
              style={styles.textInput}
              value={formData.confirmation}
              onChangeText={(value) => handleInputChange('confirmation', value)}
              placeholder="Type DELETE"
              placeholderTextColor="#999999"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]} 
            onPress={handleDeleteAccount}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>
              {isLoading ? 'Deleting Account...' : 'Delete Account Permanently'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningList: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DeleteAccount;
