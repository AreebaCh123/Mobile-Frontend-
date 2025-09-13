import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TopNavigation from '../components/TopNavigation';

const EditProfileScreen = ({ navigation, route }) => {
  // Get initial values from route params or use defaults
  const initialData = route?.params?.userData || {
    fullName: 'Sophia Bennett',
    age: '28',
    profession: 'Software Engineer',
    city: 'San Francisco',
    country: 'USA',
    maritalStatus: 'Single',
    phoneNumber: '+1 (555) 123-4567',
    email: 'sophia.bennett@email.com',
  };

  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData[field] = value;
      return newData;
    });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to settings with updated data
              navigation.goBack();
            }
          }
        ]
      );
    }, 1000);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add your profile picture',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const FormInput = React.memo(({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  ));

  return (
    <View style={styles.container}>
      <TopNavigation navigation={navigation} currentScreen="EditProfile" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Profile Picture Section */}
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity style={styles.profilePictureButton} onPress={showImagePicker}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePicture} />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Text style={styles.profilePictureIcon}>📷</Text>
                  <Text style={styles.profilePictureText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <FormInput
            label="Full Name"
            value={formData.fullName}
            onChangeText={useCallback((value) => handleInputChange('fullName', value), [handleInputChange])}
            placeholder="Enter your full name"
          />

          <FormInput
            label="Age"
            value={formData.age}
            onChangeText={useCallback((value) => handleInputChange('age', value), [handleInputChange])}
            placeholder="Enter your age"
            keyboardType="numeric"
          />

          <FormInput
            label="Profession"
            value={formData.profession}
            onChangeText={useCallback((value) => handleInputChange('profession', value), [handleInputChange])}
            placeholder="Enter your profession"
          />

          <FormInput
            label="City"
            value={formData.city}
            onChangeText={useCallback((value) => handleInputChange('city', value), [handleInputChange])}
            placeholder="Enter your city"
          />

          <FormInput
            label="Country"
            value={formData.country}
            onChangeText={useCallback((value) => handleInputChange('country', value), [handleInputChange])}
            placeholder="Enter your country"
          />

          <FormInput
            label="Marital Status"
            value={formData.maritalStatus}
            onChangeText={useCallback((value) => handleInputChange('maritalStatus', value), [handleInputChange])}
            placeholder="Enter your marital status"
          />

          <FormInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={useCallback((value) => handleInputChange('phoneNumber', value), [handleInputChange])}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <FormInput
            label="Email"
            value={formData.email}
            onChangeText={useCallback((value) => handleInputChange('email', value), [handleInputChange])}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    fontWeight: '600',
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
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
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  saveButton: {
    backgroundColor: '#BF8EEB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePictureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#BF8EEB',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profilePicturePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  profilePictureText: {
    fontSize: 12,
    color: '#BF8EEB',
    fontWeight: '500',
  },
});

export default EditProfileScreen;
