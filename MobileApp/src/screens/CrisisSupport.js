import React, { useState } from 'react';
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
} from 'react-native';

const EmergencySupportScreen = ({ navigation }) => {
  const [showAlertSent, setShowAlertSent] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSendCrisisAlert = () => {
    Alert.alert(
      'Send Crisis Alert',
      'Are you sure you want to send a crisis alert? This will notify your therapist and emergency contact immediately.',
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

  const emergencyContacts = [
    {
      name: 'Dr. Emily Carter',
      role: 'Therapist',
      phone: '+1 (555) 123-4567',
      available: 'Available 24/7',
    },
    {
      name: 'Sarah Miller',
      role: 'Emergency Contact',
      phone: '+1 (555) 987-6543',
      available: 'Available 24/7',
    },
  ];

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

  const EmergencyContact = ({ contact }) => (
    <TouchableOpacity 
      style={styles.contactCard}
      onPress={() => navigation.navigate('EmergencyContact', { contact })}
    >
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactRole}>{contact.role}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
        <Text style={styles.contactAvailable}>{contact.available}</Text>
      </View>
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => {
          // TODO: Implement actual calling functionality
          Alert.alert('Call', `Calling ${contact.name} at ${contact.phone}`);
        }}
      >
        <Text style={styles.callButtonText}>Call</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const CrisisResource = ({ resource }) => (
    <View style={styles.resourceCard}>
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle}>{resource.title}</Text>
        <Text style={styles.resourceNumber}>{resource.number}</Text>
        <Text style={styles.resourceDescription}>{resource.description}</Text>
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
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAlertSent(false)}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Alert Sent</Text>
          
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkBackground}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>
          
          <Text style={styles.confirmationText}>
            Your emergency alert has been sent. Your therapist, Dr. Emily Carter, and your emergency contact, Sarah Miller, have been notified and your location was shared.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.returnHomeButton}
              onPress={handleReturnToHome}
            >
              <Text style={styles.returnHomeButtonText}>Return to Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.chatbotButton}
              onPress={handleTalkToChatbot}
            >
              <Text style={styles.chatbotButtonText}>Talk to Chatbot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crisis Alert Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Immediate Help</Text>
          <Text style={styles.sectionDescription}>
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
          <Text style={styles.sectionTitle}>Your Support Team</Text>
          {emergencyContacts.map((contact, index) => (
            <EmergencyContact key={index} contact={contact} />
          ))}
        </View>

        {/* Crisis Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Resources</Text>
          {crisisResources.map((resource, index) => (
            <CrisisResource key={index} resource={resource} />
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tipText}>• You are not alone - help is available</Text>
            <Text style={styles.tipText}>• Reach out to someone you trust</Text>
            <Text style={styles.tipText}>• Remove any means of self-harm</Text>
            <Text style={styles.tipText}>• Go to a safe place with other people</Text>
            <Text style={styles.tipText}>• Remember that feelings are temporary</Text>
          </View>
        </View>
      </ScrollView>

      <AlertSentModal />
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
    paddingTop: 60,
    paddingBottom: 15,
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
  backIcon: {
    fontSize: 20,
    color: '#000000',
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
    paddingVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666666',
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
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 14,
    color: '#BF8EEB',
    fontWeight: '500',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  contactAvailable: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#BF8EEB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resourceCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resourceNumber: {
    fontSize: 18,
    color: '#BF8EEB',
    fontWeight: '700',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666666',
  },
  tipsCard: {
    backgroundColor: '#F0E6FF',
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
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
    color: '#999999',
    fontWeight: '300',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmarkBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E8',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  confirmationText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 32,
  },
  modalButtons: {
    gap: 12,
  },
  returnHomeButton: {
    backgroundColor: '#BF8EEB',
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
    backgroundColor: '#F0E6FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatbotButtonText: {
    color: '#BF8EEB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmergencySupportScreen;