// src/screens/TalkToDoctor.js
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

export default function TalkToDoctor({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasTherapist, setHasTherapist] = useState(false);
  const [therapistName, setTherapistName] = useState('');
  const flatListRef = useRef(null);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;
  const messageBg = isDark ? '#2A2A2F' : '#E3F2FD';
  const myMessageBg = isDark ? '#3B82F6' : '#3B82F6';

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/chat/messages/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.has_therapist) {
          setHasTherapist(true);
          setTherapistName(data.therapist_name || 'Your Doctor');
          setMessages(data.messages || []);
          // Scroll to bottom after loading
          setTimeout(() => {
            if (flatListRef.current && data.messages?.length > 0) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }, 100);
        } else {
          setHasTherapist(false);
          setMessages([]);
        }
      } else {
        if (response.status === 401) {
          navigation.navigate('Login');
        } else {
          const errorData = await response.json();
          if (errorData.error) {
            Alert.alert('Error', errorData.error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const messageToSend = messageText.trim();
    setMessageText('');

    try {
      setSending(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/chat/messages/send/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        // Scroll to bottom after sending
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || errorData.message || 'Failed to send message');
        setMessageText(messageToSend); // Restore message text on error
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessageText(messageToSend); // Restore message text on error
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_is_patient;
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMyMessage ? myMessageBg : messageBg,
              alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isMyMessage ? '#FFFFFF' : textColor,
              },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isMyMessage ? 'rgba(255,255,255,0.7)' : (isDark ? '#999' : '#666'),
              },
            ]}
          >
            {item.formatted_time}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={isDark ? '#CBA4F4' : '#2D5A27'} />
      </View>
    );
  }

  if (!hasTherapist) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Talk to Your Doctor</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.centerContent}>
          <Feather name="user-x" size={64} color={isDark ? '#444' : '#CCC'} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No Therapist Assigned</Text>
          <Text style={[styles.emptyText, { color: textColor, opacity: 0.7 }]}>
            You don't have an assigned therapist yet.{'\n'}
            Please contact support or set up your therapist in profile settings.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Talk to Your Doctor</Text>
          <Text style={[styles.headerSubtitle, { color: textColor, opacity: 0.7 }]}>
            {therapistName}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => {
          if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={48} color={isDark ? '#444' : '#CCC'} />
            <Text style={[styles.emptyText, { color: textColor, opacity: 0.7 }]}>
              No messages yet.{'\n'}Start the conversation with your therapist.
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: surfaceColor,
            borderTopColor: isDark ? '#2A2A2F' : colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? '#0F0F14' : '#F8F9FA',
              color: textColor,
              borderColor: isDark ? '#2A2A2F' : colors.border,
            },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: sending ? '#999' : '#3B82F6',
              opacity: sending || !messageText.trim() ? 0.6 : 1,
            },
          ]}
          onPress={sendMessage}
          disabled={sending || !messageText.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...type.h2,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...type.caption,
    marginTop: spacing.xs,
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    ...type.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...type.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    maxWidth: '100%',
  },
  messageText: {
    ...type.body,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  messageTime: {
    ...type.caption,
    fontSize: 11,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    ...type.body,
    minHeight: ms(44),
    maxHeight: ms(100),
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    marginRight: spacing.sm,
    fontSize: 15,
  },
  sendButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

