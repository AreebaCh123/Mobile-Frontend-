import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

const EmergencySupportScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [showAlertSent, setShowAlertSent] = useState(false);
  const { isDark } = useContext(ThemeContext);

  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile/me/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);

        // Setup therapist info from API response
        if (data.therapist) {
          setTherapist({
            id: data.therapist.id,
            name: data.therapist.full_name || data.therapist.username,
            role: 'Assigned Psychologist',
            phone: data.therapist.phone || 'N/A',
            available: 'Available via Message',
            type: 'therapist'
          });
        } else {
          setTherapist(null);
        }

        // Setup emergency contact from profile data
        if (data.emergency_contact_name) {
          setEmergencyContact({
            name: data.emergency_contact_name,
            relation: data.emergency_contact_relation,
            phone: data.emergency_contact,
            role: `Emergency Contact (${data.emergency_contact_relation})`,
            available: 'Available 24/7',
            type: 'emergency'
          });
        } else {
          setEmergencyContact(null);
        }
      }
    } catch (error) {
      console.error('Error loading profile for crisis screen:', error);
      Alert.alert('Error', 'Unable to load your support team information.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const therapistName = therapist?.name || 'your psychologist';
  const ecName = emergencyContact?.name || 'your emergency contact';

  const handleSendCrisisAlert = () => {
    Alert.alert(
      'Send Crisis Alert',
      `Are you sure you want to send a crisis alert? This will notify ${therapistName} and ${ecName} immediately.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            setShowAlertSent(true);
          },
        },
      ]
    );
  };

  const handleReturnToHome = () => {
    setShowAlertSent(false);
    navigation.navigate('Home');
  };

  const handleTalkToChatbot = () => {
    setShowAlertSent(false);
    navigation.navigate('Chat');
  };

  const crisisResources = [
    {
      title: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support',
    },
    {
      title: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: '24/7 text support',
    },
    {
      title: 'Emergency Services',
      number: '911',
      description: 'Immediate emergency help',
    },
  ];

  const SupportContact = ({ contact }) => (
    <View style={[styles.contactCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : '#E0E0E0' }]}>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: textColor }]}>{contact.name}</Text>
        <Text style={styles.contactRole}>{contact.role}</Text>
        <Text style={[styles.contactPhone, { color: isDark ? '#BBB' : '#666' }]}>{contact.phone}</Text>
        <Text style={[styles.contactAvailable, { color: '#4CAF50' }]}>{contact.available}</Text>
      </View>
      <View style={styles.contactActions}>
        {contact.type === 'therapist' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TalkToDoctor')}
          >
            <Feather name="message-square" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Text</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => Alert.alert('Call', `Calling ${contact.name} at ${contact.phone}`)}
          >
            <Feather name="phone" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const CrisisResource = ({ resource }) => (
    <View style={[styles.resourceCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : '#E0E0E0' }]}>
      <View style={styles.resourceInfo}>
        <Text style={[styles.resourceTitle, { color: textColor }]}>{resource.title}</Text>
        <Text style={styles.resourceNumber}>{resource.number}</Text>
        <Text style={[styles.resourceDescription, { color: isDark ? '#AAA' : '#666' }]}>{resource.description}</Text>
      </View>
    </View>
  );

  const AlertSentModal = () => (
    <Modal
      visible={showAlertSent}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowAlertSent(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1A1A1F' : '#FFFFFF' }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAlertSent(false)}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>

          <Text style={[styles.modalTitle, { color: textColor }]}>Alert Sent</Text>

          <View style={styles.checkmarkContainer}>
            <View style={[styles.checkmarkBackground, { backgroundColor: isDark ? '#2D4A27' : '#E8F5E8' }]}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>

          <Text style={[styles.confirmationText, { color: isDark ? '#DDD' : '#333' }]}>
            Your emergency alert has been sent. {therapist ? `Dr. ${therapist.name}` : 'Your psychologist'} and your emergency contact, {emergencyContact ? emergencyContact.name : 'Sarah Miller'}, have been notified and your location was shared.
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.returnHomeButton}
              onPress={handleReturnToHome}
            >
              <Text style={styles.returnHomeButtonText}>Return to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chatbotButton, { backgroundColor: isDark ? '#2A2A2F' : '#F0E6FF' }]}
              onPress={handleTalkToChatbot}
            >
              <Text style={[styles.chatbotButtonText, { color: colors.accent }]}>Talk to Chatbot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 20, color: textColor, opacity: 0.7 }}>Loading your support team...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Emergency Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crisis Alert Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Immediate Help</Text>
          <Text style={[styles.sectionDescription, { color: isDark ? '#AAA' : '#666' }]}>
            If you're in immediate danger or having thoughts of self-harm, use the crisis alert below.
          </Text>
          <TouchableOpacity
            style={styles.crisisAlertButton}
            onPress={handleSendCrisisAlert}
          >
            <Text style={styles.crisisAlertButtonText}>Send Crisis Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Your Support Team</Text>
          {!therapist && !emergencyContact && (
            <View style={[styles.emptySupportCard, { backgroundColor: surfaceColor }]}>
              <Feather name="info" size={24} color={colors.accent} />
              <Text style={[styles.emptySupportText, { color: isDark ? '#AAA' : '#666' }]}>
                No assigned psychologist or emergency contact found. Please update them in your profile.
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={styles.setupButtonText}>Go to Settings</Text>
              </TouchableOpacity>
            </View>
          )}
          {therapist && <SupportContact contact={therapist} />}
          {emergencyContact && <SupportContact contact={emergencyContact} />}
        </View>

        {/* Crisis Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Crisis Resources</Text>
          {crisisResources.map((resource, index) => (
            <CrisisResource key={index} resource={resource} />
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Safety Tips</Text>
          <View style={[styles.tipsCard, { backgroundColor: isDark ? '#1A1D2D' : '#F0E6FF' }]}>
            <Text style={[styles.tipText, { color: isDark ? '#CBA4F4' : '#333' }]}>• You are not alone - help is available</Text>
            <Text style={[styles.tipText, { color: isDark ? '#CBA4F4' : '#333' }]}>• Reach out to someone you trust</Text>
            <Text style={[styles.tipText, { color: isDark ? '#CBA4F4' : '#333' }]}>• Remove any means of self-harm</Text>
            <Text style={[styles.tipText, { color: isDark ? '#CBA4F4' : '#333' }]}>• Go to a safe place with other people</Text>
            <Text style={[styles.tipText, { color: isDark ? '#CBA4F4' : '#333' }]}>• Remember that feelings are temporary</Text>
          </View>
        </View>
      </ScrollView>

      <AlertSentModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: ms(20),
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  crisisAlertButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  crisisAlertButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  contactCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contactPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactAvailable: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactActions: {
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySupportCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptySupportText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  setupButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  setupButtonText: {
    color: colors.accent,
    fontWeight: '600',
  },
  resourceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceNumber: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 24,
    color: '#999',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmarkBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 32,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  confirmationText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButtons: {
    gap: 12,
  },
  returnHomeButton: {
    backgroundColor: '#2D5A27',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  returnHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatbotButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatbotButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmergencySupportScreen;