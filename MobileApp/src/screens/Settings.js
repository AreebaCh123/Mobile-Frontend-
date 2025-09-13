// src/screens/Settings.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';

export default function Settings({ navigation }) {
  // toggle states
  const [taskReminders, setTaskReminders] = useState(false);
  const [medicationReminders, setMedicationReminders] = useState(false);
  const [journalReminders, setJournalReminders] = useState(false);
  const [chatbotReplies, setChatbotReplies] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity>
          <Feather name="user" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoRow}>
          <Feather name="user" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>Sophia Bennett</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="calendar" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>28</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="briefcase" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Profession</Text>
            <Text style={styles.infoValue}>Software Engineer</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>City, Country</Text>
            <Text style={styles.infoValue}>San Francisco, USA</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="heart" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Marital Status</Text>
            <Text style={styles.infoValue}>Single</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="phone" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>+1 (555) 123-4567</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="mail" size={20} color={colors.accent} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>sophia.bennett@email.com</Text>
          </View>
        </View>

        {/* 👉 Navigate to Edit Profile */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.primaryText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Emergency Contact */}
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
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
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
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
        <Text style={styles.sectionTitle}>Language & Theme Settings</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Language</Text>
          <Text style={styles.infoValue}>English</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Theme</Text>
          <Switch
            value={darkTheme}
            onValueChange={setDarkTheme}
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
                  onPress: () => {
                    navigation.navigate('Onboarding');
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
  primaryBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    height: ms(48),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
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
