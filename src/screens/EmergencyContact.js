// src/screens/EmergencyContact.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

export default function EmergencyContact({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    relation: '',
  });
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    let isActive = true;
    const loadContact = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const entries = await AsyncStorage.multiGet(['authToken']);
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
            setErrorMessage('Please complete your profile before adding an emergency contact.');
          } else if (response.status === 401) {
            setErrorMessage('Session expired. Please log in again.');
          } else {
            setErrorMessage('Unable to load emergency contact info.');
          }
          return;
        }

        const data = await response.json();
        if (!isActive) return;
        setForm({
          name: data?.emergency_contact_name ?? '',
          phone: data?.emergency_contact ?? '',
          relation: data?.emergency_contact_relation ?? '',
        });
      } catch (error) {
        console.log('EmergencyContact load error:', error);
        if (isActive) {
          setErrorMessage('Unable to load contact. Check your network connection.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadContact();
    return () => {
      isActive = false;
    };
  }, []);

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert('Missing information', 'Contact name is required.');
      return false;
    }
    if (!form.relation.trim()) {
      Alert.alert('Missing information', 'Relation is required.');
      return false;
    }
    if (!form.phone.trim()) {
      Alert.alert('Missing information', 'Contact phone is required.');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (loading || saving) return;
    if (!validateForm()) return;
    if (!authToken) {
      Alert.alert('Session expired', 'Please log in again.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/users/profile/me/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          emergency_contact_name: form.name.trim(),
          emergency_contact_relation: form.relation.trim(),
          emergency_contact: form.phone.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.log('Emergency contact update error:', data);
        const message =
          typeof data === 'object' && data !== null
            ? Object.values(data)[0]
            : 'Unable to update emergency contact.';
        Alert.alert('Update failed', Array.isArray(message) ? message.join('\n') : message);
        return;
      }

      Alert.alert('Contact updated', 'Emergency contact details saved.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log('Emergency contact network error:', error);
      Alert.alert(
        'Network error',
        'Could not reach the server. Please check your connection and try again.'
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Update Contact</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>Loading contact...</Text>
          </View>
        ) : (
          <>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <View style={styles.form}>
              <Field
                label="Contact Name"
                value={form.name}
                onChangeText={(t) => update('name', t)}
              />
              <Field
                label="Phone Number"
                value={form.phone}
                keyboardType="phone-pad"
                onChangeText={(t) => update('phone', t)}
              />
              <Field
                label="Relation"
                value={form.relation}
                onChangeText={(t) => update('relation', t)}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, (saving || loading) && styles.primaryBtnDisabled]}
              onPress={onSubmit}
              disabled={saving || loading}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>Update</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedText}
        style={styles.input}
        {...props}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryBtn: {
    height: ms(52),
    borderRadius: radii.pill,
    backgroundColor: '#2D5A27',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing['3xl'],
    width: '50%',
    alignSelf: 'center',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryText: { ...type.h2, color: colors.white, textAlign: 'center' },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...type.body,
    color: colors.mutedText,
  },
  errorText: {
    ...type.body,
    color: '#EF4444',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
});
