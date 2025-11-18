// src/screens/Settings.js
import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import { ThemeContext } from '../context/ThemeContext';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

export default function Settings({ navigation }) {
  // toggle states
  const [taskReminders, setTaskReminders] = useState(false);
  const [medicationReminders, setMedicationReminders] = useState(false);
  const [journalReminders, setJournalReminders] = useState(false);
  const [chatbotReplies, setChatbotReplies] = useState(false);
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [storedUser, setStoredUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setProfileError(null);
      const entries = await AsyncStorage.multiGet(['authToken', 'userProfile']);
      const entryMap = Object.fromEntries(entries || []);
      const token = entryMap?.authToken;
      const storedUserJson = entryMap?.userProfile;
      const parsedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
      setStoredUser(parsedUser);

      if (!token) {
        setProfile(null);
        setProfileError('Please sign in again to view your profile.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setProfile(null);
          setProfileError('Profile not found. Please complete your profile setup.');
        } else if (response.status === 401) {
          setProfileError('Session expired. Please log in again.');
        } else {
          const errorText = await response.text();
          console.log('Profile fetch error:', errorText);
          setProfileError('Unable to load profile at the moment.');
        }
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.log('Profile load error:', error);
      setProfileError('Unable to load profile. Check your network connection.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const personalInfo = useMemo(() => {
    const profileUser = profile?.user;
    const firstName = profileUser?.first_name || storedUser?.first_name || '';
    const lastName = profileUser?.last_name || storedUser?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || profileUser?.username || storedUser?.username || null;

    const locationParts = [
      profile?.city?.trim(),
      profile?.country?.trim(),
    ].filter(Boolean);

    // Get therapist name
    const therapist = profile?.therapist;
    const therapistName = therapist
      ? `${therapist.first_name || ''} ${therapist.last_name || ''}`.trim() || therapist.username
      : null;

    return {
      fullName,
      age: profile?.age !== undefined && profile?.age !== null ? String(profile.age) : null,
      profession: profile?.profession || null,
      location: locationParts.length ? locationParts.join(', ') : null,
      maritalStatus: profile?.marital_status || null,
      phone: profile?.phone || null,
      email: profileUser?.email || storedUser?.email || null,
      therapistName,
    };
  }, [profile, storedUser]);

  const emergencyInfo = useMemo(() => {
    return {
      name: profile?.emergency_contact_name || null,
      relation: profile?.emergency_contact_relation || null,
      phone: profile?.emergency_contact || null,
    };
  }, [profile]);

  const InfoRow = ({ icon, label, value }) => {
    const displayValue = value || 'Not provided';
    return (
      <View style={styles.infoRow}>
        <Feather name={icon} size={20} color={colors.accent} />
        <View style={styles.infoTextWrap}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, !value && styles.infoValuePlaceholder]}>
            {displayValue}
          </Text>
        </View>
      </View>
    );
  };

  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <TouchableOpacity>
          <Feather name="user" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        {/* Personal Information */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Personal Information</Text>

        {loadingProfile ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            {profileError ? (
              <Text style={styles.infoStateText}>{profileError}</Text>
            ) : null}
            <InfoRow icon="user" label="Full Name" value={personalInfo.fullName} />
            <InfoRow icon="calendar" label="Age" value={personalInfo.age} />
            <InfoRow icon="briefcase" label="Profession" value={personalInfo.profession} />
            <InfoRow icon="map-pin" label="City, Country" value={personalInfo.location} />
            <InfoRow icon="heart" label="Marital Status" value={personalInfo.maritalStatus} />
            <InfoRow icon="phone" label="Phone Number" value={personalInfo.phone} />
            <InfoRow icon="mail" label="Email" value={personalInfo.email} />
            <InfoRow icon="user-check" label="Assigned Doctor" value={personalInfo.therapistName} />
          </>
        )}

        {/* 👉 Navigate to Edit Profile */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.primaryText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Emergency Contact */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Emergency Contact</Text>
        {!loadingProfile && !profileError ? (
          <>
            <InfoRow icon="user-check" label="Contact Name" value={emergencyInfo.name} />
            <InfoRow icon="users" label="Relation" value={emergencyInfo.relation} />
            <InfoRow icon="phone-call" label="Phone" value={emergencyInfo.phone} />
          </>
        ) : null}
        <View style={styles.emergencyImageContainer}>
          <Image
            source={require('../../assets/s3.png')}
            style={styles.emergencyImage}
            resizeMode="cover"
          />
        </View>

        {/* 👉 Navigate to Emergency Contact */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EmergencyContact')}
        >
          <Text style={styles.primaryText}>Update Emergency Contact</Text>
        </TouchableOpacity>

        {/* Notification Preferences */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Notification Preferences</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Task Reminders</Text>
          <Switch
            value={taskReminders}
            onValueChange={setTaskReminders}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Medication Reminders</Text>
          <Switch
            value={medicationReminders}
            onValueChange={setMedicationReminders}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Journal Reminders</Text>
          <Switch
            value={journalReminders}
            onValueChange={setJournalReminders}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Chatbot Replies</Text>
          <Switch
            value={chatbotReplies}
            onValueChange={setChatbotReplies}
            trackColor={{ true: colors.primary }}
          />
        </View>

        {/* Language & Theme */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Language & Theme Settings</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Language</Text>
          <Text style={styles.infoValue}>English</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Theme</Text>
          <Switch
            value={isDark}
            onValueChange={setIsDark}
            trackColor={{ true: colors.primary }}
          />
        </View>

        {/* Log Out & Delete */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            Alert.alert(
              'Log Out',
              'Are you sure you want to log out?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.clear();
                    } catch (e) {
                      console.log('Error clearing storage on logout:', e);
                    }
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Onboarding' }],
                    });
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.primaryText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('DeleteAccount')}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

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
  sectionTitle: {
    ...type.h2,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  infoTextWrap: { marginLeft: spacing.md },
  infoLabel: { ...type.caption, color: colors.mutedText },
  infoValue: { ...type.body, color: colors.accent, fontWeight: '600' },
  infoValuePlaceholder: {
    color: colors.mutedText,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    ...type.body,
    color: colors.mutedText,
    marginLeft: spacing.sm,
  },
  infoStateText: {
    ...type.body,
    color: colors.mutedText,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    height: ms(48),
    borderRadius: radii.pill,
    backgroundColor: '#2D5A27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: colors.white, fontWeight: '700' },
  emergencyImageContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emergencyImage: {
    borderRadius: radii.md,
    height: ms(140),
    width: ms(200),
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  toggleLabel: { ...type.body, color: colors.text },
  deleteText: {
    textAlign: 'center',
    color: '#EF4444',
    marginTop: spacing.lg,
    ...type.body,
  },
});
