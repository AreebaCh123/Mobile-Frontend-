
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import TopNavigation from '../components/TopNavigation';

const SettingsScreen = ({ navigation }) => {
  const [taskReminders, setTaskReminders] = useState(false);
  const [medicationReminders, setMedicationReminders] = useState(false);
  const [journalReminders, setJournalReminders] = useState(false);
  const [chatbotReplies, setChatbotReplies] = useState(false);
  const [themeEnabled, setThemeEnabled] = useState(false);

  const PersonalInfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const NotificationItem = React.memo(({ label, value, onToggle }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5E5', true: '#BF8EEB' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E5E5E5"
      />
    </View>
  ));

  return (
    <View style={styles.container}>
      <TopNavigation navigation={navigation} currentScreen="Settings" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <PersonalInfoItem
            icon="👤"
            label="Full Name"
            value="Sophia Bennett"
          />
          <PersonalInfoItem
            icon="📅"
            label="Age"
            value="28"
          />
          <PersonalInfoItem
            icon="💼"
            label="Profession"
            value="Software Engineer"
          />
          <PersonalInfoItem
            icon="📍"
            label="City, Country"
            value="San Francisco, USA"
          />
          <PersonalInfoItem
            icon="💖"
            label="Marital Status"
            value="Single"
          />
          <PersonalInfoItem
            icon="📞"
            label="Phone Number"
            value="+1 (555) 123-4567"
          />
          <PersonalInfoItem
            icon="✉️"
            label="Email"
            value="sophia.bennett@email.com"
          />
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', {
              userData: {
                fullName: 'Sophia Bennett',
                age: '28',
                profession: 'Software Engineer',
                city: 'San Francisco',
                country: 'USA',
                maritalStatus: 'Single',
                phoneNumber: '+1 (555) 123-4567',
                email: 'sophia.bennett@email.com',
              }
            })}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyImageContainer}>
              <View style={styles.emergencyFrame}>
                <View style={styles.emergencyImage}>
                  <View style={styles.emergencyImageContent} />
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.updateButton}>
            <Text style={styles.updateButtonText}>Update Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          <NotificationItem
            label="Task Reminders"
            value={taskReminders}
            onToggle={setTaskReminders}
          />
          <NotificationItem
            label="Medication Reminders"
            value={medicationReminders}
            onToggle={setMedicationReminders}
          />
          <NotificationItem
            label="Journal Reminders"
            value={journalReminders}
            onToggle={setJournalReminders}
          />
          <NotificationItem
            label="Chatbot Replies"
            value={chatbotReplies}
            onToggle={setChatbotReplies}
          />
        </View>

        {/* Language & Theme Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Theme Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Switch
              value={themeEnabled}
              onValueChange={setThemeEnabled}
              trackColor={{ false: '#E5E5E5', true: '#BF8EEB' }}
              thumbColor={themeEnabled ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E5E5E5"
            />
          </View>
        </View>


        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📖</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Text style={styles.navIcon}>☑️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🚀</Text>
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
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F0E6FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#BF8EEB',
    fontWeight: '500',
  },
  editButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#BF8EEB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  emergencyImageContainer: {
    width: 120,
    height: 120,
  },
  emergencyFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D2B48C',
    borderRadius: 8,
    padding: 8,
  },
  emergencyImage: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyImageContent: {
    width: 60,
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
  },
  updateButton: {
    backgroundColor: '#BF8EEB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLabel: {
    fontSize: 16,
    color: '#000000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  settingValue: {
    fontSize: 16,
    color: '#BF8EEB',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutButton: {
    backgroundColor: '#BF8EEB',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#BF8EEB',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navIcon: {
    fontSize: 20,
    color: '#999999',
  },
  navIconActive: {
    color: '#000000',
  },
});

export default SettingsScreen;
