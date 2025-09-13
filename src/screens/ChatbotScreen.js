import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import TopNavigation from '../components/TopNavigation';

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "how're you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
    },
    {
      id: 3,
      text: "hey",
      sender: 'user',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef(null);

  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Keyword-based responses
    if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried')) {
      return [
        "I understand anxiety can be overwhelming. Let's try some breathing exercises together.",
        "Anxiety is tough, but you're not alone. What's making you feel anxious right now?",
        "It's okay to feel anxious. Would you like me to guide you through a relaxation technique?"
      ][Math.floor(Math.random() * 3)];
    }
    
    if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
      return [
        "I'm sorry you're feeling sad. Your feelings are completely valid.",
        "It's okay to feel down sometimes. I'm here to listen and support you.",
        "Feeling sad can be really hard. What would help you feel a little better right now?"
      ][Math.floor(Math.random() * 3)];
    }
    
    if (message.includes('angry') || message.includes('mad') || message.includes('frustrated')) {
      return [
        "I can hear that you're feeling frustrated. That's completely understandable.",
        "Anger is a valid emotion. What's making you feel this way?",
        "It's okay to feel angry. Let's talk about what's bothering you."
      ][Math.floor(Math.random() * 3)];
    }
    
    if (message.includes('tired') || message.includes('exhausted') || message.includes('sleep')) {
      return [
        "It sounds like you're feeling really tired. Have you been getting enough rest?",
        "Fatigue can really affect how we feel. What's been keeping you up?",
        "Being tired can make everything feel harder. How can we help you get better rest?"
      ][Math.floor(Math.random() * 3)];
    }
    
    if (message.includes('help') || message.includes('support')) {
      return [
        "I'm here to help you. What kind of support do you need right now?",
        "You're not alone in this. I'm here to support you through whatever you're going through.",
        "I want to help you feel better. What would be most helpful right now?"
      ][Math.floor(Math.random() * 3)];
    }
    
    if (message.includes('good') || message.includes('great') || message.includes('better') || message.includes('happy')) {
      return [
        "I'm so glad to hear you're feeling better! That's wonderful news.",
        "It makes me happy to know you're doing well. What's been helping you feel good?",
        "That's fantastic! I'm here to celebrate the good moments with you too."
      ][Math.floor(Math.random() * 3)];
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return [
        "You're very welcome! I'm always here when you need to talk.",
        "It's my pleasure to be here for you. How are you feeling now?",
        "I'm glad I could help. Remember, I'm always here to listen."
      ][Math.floor(Math.random() * 3)];
    }
    
    // Greeting responses
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return [
        "Hello! I'm so glad you're here. How are you feeling today?",
        "Hi there! I'm here to listen and support you. What's on your mind?",
        "Hey! It's good to see you. How can I help you today?"
      ][Math.floor(Math.random() * 3)];
    }
    
    // Default contextual responses
    const defaultResponses = [
      "I'm here to listen. Can you tell me more about what you're experiencing?",
      "That sounds really important. I'm listening and I care about what you're going through.",
      "Thank you for sharing that with me. How are you feeling about this?",
      "I understand this is difficult for you. You're not alone in this.",
      "I'm here for you. What would help you feel more supported right now?",
      "Your feelings are completely valid. Let's work through this together.",
      "It takes courage to talk about these things. I'm proud of you for reaching out.",
      "I'm listening carefully. What else would you like to share?",
      "This sounds challenging. How can I best support you right now?",
      "I'm here to help you through this. What do you need most right now?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const quickReplies = [
    "I'm feeling anxious",
    "I'm having a tough day",
    "I need some support",
    "I'm feeling better",
    "Can you help me relax?",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Generate intelligent AI response
    setTimeout(() => {
      const intelligentResponse = getAIResponse(inputText.trim());
      const aiMessage = {
        id: Date.now() + 1,
        text: intelligentResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickReply = (reply) => {
    setInputText(reply);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
    Alert.alert(
      'Voice Input',
      'Voice input feature will be implemented with speech recognition library.',
      [{ text: 'OK' }]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>N</Text>
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {message.text}
          </Text>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>S</Text>
          </View>
        )}
      </View>
    );
  };

  const TypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarText}>N</Text>
      </View>
      <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopNavigation navigation={navigation} currentScreen="Chatbot" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hey, I'm Here for You</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Quick Replies */}
        {messages.length <= 3 && (
          <View style={styles.quickRepliesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickReplies}>
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyButton}
                  onPress={() => handleQuickReply(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#999999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
              onPress={handleVoiceInput}
            >
              <Text style={styles.voiceIcon}>🎤</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  userBubble: {
    backgroundColor: '#BF8EEB',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#F0E6FF',
    borderBottomLeftRadius: 6,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666666',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#BF8EEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999999',
    marginHorizontal: 2,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickReplies: {
    flexDirection: 'row',
  },
  quickReplyButton: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickReplyText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 8,
    maxHeight: 100,
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FF4444',
  },
  voiceIcon: {
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#BF8EEB',
  },
  sendButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ChatbotScreen;
