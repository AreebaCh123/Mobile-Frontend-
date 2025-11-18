// src/screens/EditProfile.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    profession: '',
    city: '',
    country: '',
    maritalStatus: '',
    phone: '',
    email: '',
    therapistId: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [showTherapistPicker, setShowTherapistPicker] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const loadTherapists = async (token) => {
    try {
      setLoadingTherapists(true);
      const response = await fetch(`${API_BASE_URL}/api/users/therapists/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      }
    } catch (error) {
      console.log('Error loading therapists:', error);
    } finally {
      setLoadingTherapists(false);
    }
  };

  const selectTherapist = (therapist) => {
    update('therapistId', String(therapist.id));
    setShowTherapistPicker(false);
  };

  const getTherapistName = () => {
    if (!form.therapistId) return null;
    const therapist = therapists.find(t => String(t.id) === form.therapistId);
    return therapist ? (therapist.full_name || therapist.username) : null;
  };

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

  useEffect(() => {
    let isActive = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const entries = await AsyncStorage.multiGet(['authToken', 'userProfile']);
        const entryMap = Object.fromEntries(entries || []);
        const token = entryMap?.authToken;
        if (!token) {
          if (isActive) {
            setErrorMessage('Session expired. Please log in again.');
          }
          return;
        }
        if (isActive) {
          setAuthToken(token);
        }
        const response = await fetch(`${API_BASE_URL}/api/users/profile/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (!isActive) return;
          if (response.status === 404) {
            setErrorMessage('Profile not found. Please complete your profile setup first.');
          } else if (response.status === 401) {
            setErrorMessage('Session expired. Please log in again.');
          } else {
            setErrorMessage('Unable to load profile. Please try again later.');
          }
          return;
        }

        const data = await response.json();
        if (!isActive) return;
        const user = data?.user ?? {};
        const therapist = data?.therapist;
        setForm({
          fullName:
            `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
            user.username ||
            '',
          age: data?.age ? String(data.age) : '',
          profession: data?.profession ?? '',
          city: data?.city ?? '',
          country: data?.country ?? '',
          maritalStatus: data?.marital_status ?? '',
          phone: data?.phone ?? '',
          email: user?.email ?? '',
          therapistId: therapist?.id ? String(therapist.id) : '',
        });
        
        // Load available therapists
        loadTherapists(token);
      } catch (error) {
        console.log('EditProfile fetch error:', error);
        if (isActive) {
          setErrorMessage('Unable to load profile. Check your network connection.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isActive = false;
    };
  }, []);

  const validateForm = () => {
    const requiredFields = [
      { key: 'fullName', label: 'Full Name' },
      { key: 'age', label: 'Age' },
      { key: 'profession', label: 'Profession' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
      { key: 'maritalStatus', label: 'Marital Status' },
      { key: 'phone', label: 'Phone Number' },
    ];

    for (const field of requiredFields) {
      if (!String(form[field.key]).trim()) {
        Alert.alert('Missing information', `${field.label} is required.`);
        return false;
      }
    }

    const ageNumber = Number(form.age);
    if (Number.isNaN(ageNumber) || ageNumber <= 0) {
      Alert.alert('Invalid age', 'Please enter a valid age greater than zero.');
      return false;
    }

    return true;
  };

  const onSave = async () => {
    if (loading || saving) return;
    if (!validateForm()) return;
    if (!authToken) {
      Alert.alert('Session expired', 'Please log in again.');
      return;
    }

    const payload = {
      full_name: form.fullName.trim(),
      age: Number(form.age),
      profession: form.profession.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      marital_status: form.maritalStatus.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };

    // Update therapist assignment separately
    try {
      const therapistPayload = {
        therapist_id: form.therapistId ? Number(form.therapistId) : 0,
      };
      const therapistResponse = await fetch(`${API_BASE_URL}/api/users/therapist/assign/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(therapistPayload),
      });
      // Don't fail the whole save if therapist assignment fails
      if (!therapistResponse.ok) {
        console.log('Therapist assignment update failed');
      }
    } catch (therapistError) {
      console.log('Error updating therapist assignment:', therapistError);
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/users/profile/me/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        console.log('Profile update error:', data);
        const message =
          typeof data === 'object' && data !== null
            ? Object.values(data)[0]
            : 'Unable to update profile. Please try again.';
        Alert.alert('Update failed', Array.isArray(message) ? message.join('\n') : message);
        return;
      }

      const updatedUser = data?.profile?.user;
      if (updatedUser) {
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      }

      Alert.alert('Profile updated', 'Your personal information has been saved.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log('Profile update network error:', error);
      Alert.alert(
        'Network error',
        'Could not reach the server. Make sure you are connected to the internet and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Profile</Text>
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

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
              <>
                <View style={styles.form}>
                  <Field
                    label="Full Name"
                    value={form.fullName}
                    onChangeText={(t) => update('fullName', t)}
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
                    autoCapitalize="none"
                    onChangeText={(t) => update('email', t)}
                  />
                  
                  {/* Therapist Selection */}
                  <View style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.label}>Assigned Doctor</Text>
                    <TouchableOpacity
                      style={[
                        styles.therapistSelector,
                        {
                          backgroundColor: surfaceColor,
                          borderColor: isDark ? '#2A2A2F' : colors.border,
                        },
                      ]}
                      onPress={() => setShowTherapistPicker(true)}
                    >
                      <Text
                        style={[
                          styles.therapistSelectorText,
                          {
                            color: getTherapistName() ? textColor : colors.mutedText,
                          },
                        ]}
                      >
                        {getTherapistName() || 'Select a doctor (optional)'}
                      </Text>
                      <Feather name="chevron-down" size={20} color={colors.mutedText} />
                    </TouchableOpacity>
                    {form.therapistId && (
                      <TouchableOpacity
                        style={styles.removeTherapistBtn}
                        onPress={() => update('therapistId', '')}
                      >
                        <Feather name="x" size={16} color="#EF4444" />
                        <Text style={styles.removeTherapistText}>Remove doctor</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    (saving || loading) && styles.primaryBtnDisabled,
                  ]}
                  onPress={onSave}
                  disabled={saving || loading}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>Save</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Therapist Picker Modal */}
      <Modal
        visible={showTherapistPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTherapistPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Doctor</Text>
              <TouchableOpacity onPress={() => setShowTherapistPicker(false)}>
                <Feather name="x" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            {loadingTherapists ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.modalLoadingText, { color: textColor }]}>Loading doctors...</Text>
              </View>
            ) : therapists.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={[styles.modalEmptyText, { color: textColor, opacity: 0.7 }]}>
                  No doctors available at the moment.
                </Text>
              </View>
            ) : (
              <FlatList
                data={therapists}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.therapistItem,
                      {
                        backgroundColor: String(item.id) === form.therapistId
                          ? (isDark ? '#2A2A2F' : '#E3F2FD')
                          : 'transparent',
                      },
                    ]}
                    onPress={() => selectTherapist(item)}
                  >
                    <View style={styles.therapistItemContent}>
                      <Text style={[styles.therapistItemName, { color: textColor }]}>
                        {item.full_name || item.username}
                      </Text>
                      {item.email && (
                        <Text style={[styles.therapistItemEmail, { color: textColor, opacity: 0.7 }]}>
                          {item.email}
                        </Text>
                      )}
                    </View>
                    {String(item.id) === form.therapistId && (
                      <Feather name="check" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    ...type.body,
    color: colors.mutedText,
  },
  errorText: {
    ...type.body,
    color: '#EF4444',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
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
  therapistSelector: {
    height: ms(INPUT_H),
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  therapistSelectorText: {
    ...type.body,
    flex: 1,
  },
  removeTherapistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  removeTherapistText: {
    ...type.caption,
    color: '#EF4444',
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...type.h2,
    fontWeight: '700',
  },
  modalLoading: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalLoadingText: {
    ...type.body,
    marginTop: spacing.sm,
  },
  modalEmpty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalEmptyText: {
    ...type.body,
    textAlign: 'center',
  },
  therapistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  therapistItemContent: {
    flex: 1,
  },
  therapistItemName: {
    ...type.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  therapistItemEmail: {
    ...type.caption,
    fontSize: 12,
  },
});
