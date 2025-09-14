// src/screens/EditProfile.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    profession: '',
    city: '',
    country: '',
    maritalStatus: '',
    phone: '',
    email: '',
  });
  const [profileImage, setProfileImage] = useState(null);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const pickImage = async () => {
    // Show action sheet first
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required', 
          'To take a photo, please allow camera access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // This would open device settings in a real app
              Alert.alert('Settings', 'Please go to Settings > Apps > MindMate > Permissions and enable Camera access.');
            }}
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openImageLibrary = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'MindMate needs access to your photo library to select a profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Allow Access', onPress: () => {
              // Try to request permission again
              ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => {
                if (status === 'granted') {
                  openImageLibrary();
                } else {
                  Alert.alert('Permission Denied', 'Photo library access is required to select a profile picture.');
                }
              });
            }}
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  const onSave = () => {
    // TODO: persist form and profile image
    Alert.alert('Success', 'Profile updated successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Feather name="camera" size={32} color={colors.mutedText} />
                <Text style={styles.photoText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Field
            label="Full Name"
            value={form.name}
            onChangeText={(t) => update('name', t)}
          />
          <Field
            label="Age"
            value={form.age}
            keyboardType="number-pad"
            onChangeText={(t) => update('age', t)}
          />
          <Field
            label="Profession"
            value={form.profession}
            onChangeText={(t) => update('profession', t)}
          />
          <Field
            label="City"
            value={form.city}
            onChangeText={(t) => update('city', t)}
          />
          <Field
            label="Country"
            value={form.country}
            onChangeText={(t) => update('country', t)}
          />
          <Field
            label="Marital Status"
            value={form.maritalStatus}
            onChangeText={(t) => update('maritalStatus', t)}
          />
          <Field
            label="Phone Number"
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(t) => update('phone', t)}
          />
          <Field
            label="Email"
            value={form.email}
            keyboardType="email-address"
            onChangeText={(t) => update('email', t)}
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
          <Text style={styles.primaryText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedText}
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const INPUT_H = 52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerTitle: { ...type.h2, color: colors.text },
  form: { paddingHorizontal: spacing.xl },
  label: { ...type.body, color: colors.text, marginBottom: spacing.sm },
  input: {
    height: ms(INPUT_H),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    ...type.body,
  },
  primaryBtn: {
    height: ms(52),
    borderRadius: radii.pill,
    backgroundColor: '#2D5A27',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryText: { ...type.h2, color: colors.white },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  photoContainer: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    ...type.caption,
    color: colors.mutedText,
    marginTop: spacing.xs,
  },
  changePhotoButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: '#2D5A27',
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  changePhotoText: {
    ...type.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
