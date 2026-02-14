// src/screens/Chatbot.js
import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function Chatbot({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef(null);

  const quickReplies = [
    "I'm feeling anxious",
    "I'm having a tough day", 
    "I need some support",
    "I'm feeling better",
    "Can you help me relax?",
  ];

  // Load user info from AsyncStorage
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userProfileStr = await AsyncStorage.getItem("userProfile");
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          setUserId(userProfile.id);
          setUserName(userProfile.first_name || userProfile.username || "User");
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };
    loadUserInfo();
  }, []);

  // Start conversation and load history on mount
  useEffect(() => {
    if (userId) {
      initializeChat();
    }
  }, [userId]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Load conversation history first
      await loadConversationHistory();
      
      // Start new conversation if no history exists
      if (messages.length === 0) {
        await startConversation();
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to the chatbot. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token || !userId) return;

      const response = await fetch(`${API_BASE_URL}/api/chatbot/session/${userId}/history/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          // Convert API messages to UI format
          const formattedMessages = data.messages.map((msg) => ({
            id: msg.id.toString(),
            author: msg.role === "user" ? "me" : "bot",
            name: msg.role === "user" ? "You" : "Nia",
            text: msg.content,
            createdAt: msg.created_at,
          }));
          setMessages(formattedMessages);
          setConversationStarted(true);
          
          // Scroll to bottom after loading
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
      // Don't show error to user, just continue with new conversation
    }
  };

  const startConversation = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token || !userId) {
        Alert.alert("Error", "Please log in to use the chatbot.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chatbot/session/start/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: userName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const greetingMessage = {
          id: Date.now().toString(),
          author: "bot",
          name: "Nia",
          text: data.greeting || "Hello! I'm here to listen and support you. How are you feeling today?",
        };
        setMessages([greetingMessage]);
        setConversationStarted(true);
        
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      // Fallback greeting if API fails
      const fallbackMessage = {
        id: Date.now().toString(),
        author: "bot",
        name: "Nia",
        text: "Hello! I'm here to listen and support you. How are you feeling today?",
      };
      setMessages([fallbackMessage]);
      Alert.alert(
        "Connection Issue",
        "Could not connect to the chatbot server. Please try again later."
      );
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !userId) return;

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now().toString(),
      author: "me",
      name: "You",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    scrollRef.current?.scrollToEnd({ animated: true });

    // Create bot message placeholder for streaming
    const botMessageId = (Date.now() + 1).toString();
    const botMessage = {
      id: botMessageId,
      author: "bot",
      name: "Nia",
      text: "",
    };
    setMessages((prev) => [...prev, botMessage]);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/chatbot/message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          user_name: userName,
        }),
      });

      if (response.ok) {
        // React Native fetch doesn't expose a readable stream body with getReader().
        // Read the full SSE payload as text and parse events after the request finishes.
        const sseText = await response.text();
        let fullText = '';
        let streamError = null;

        // Normalize line endings (backend may send \n\n; proxies sometimes use \r\n)
        const normalized = sseText.replace(/\r\n/g, '\n').trim();
        const blocks = normalized.split(/\n\n+/);

        for (const block of blocks) {
          const line = block.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const raw = line.slice(6).trim();
            const data = JSON.parse(raw);
            if (data.type === 'token' && data.content != null) {
              fullText += data.content;
            } else if (data.type === 'error' && data.content) {
              streamError = data.content;
            }
          } catch (e) {
            console.error('Error parsing SSE block:', e);
          }
        }

        // Use stream error as message if we have no content but got an error event
        const textToShow = fullText || streamError || '';

        if (textToShow) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: textToShow } : msg
            )
          );
        } else {
          // Stream may not be fully received in RN (e.g. chunked response). Fetch latest from history.
          try {
            const historyRes = await fetch(
              `${API_BASE_URL}/api/chatbot/session/${userId}/history/`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              const messages = historyData.messages || [];
              const lastAssistant = [...messages]
                .reverse()
                .find((m) => m.role === 'assistant');
              if (lastAssistant && lastAssistant.content) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: lastAssistant.content }
                      : msg
                  )
                );
                scrollRef.current?.scrollToEnd({ animated: true });
                return;
              }
            }
          } catch (historyErr) {
            console.error('Fallback history fetch failed:', historyErr);
          }
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: "I'm here to listen. Can you tell me more?" }
                : msg
            )
          );
        }

        scrollRef.current?.scrollToEnd({ animated: true });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Update bot message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
              }
            : msg
        )
      );
      Alert.alert(
        "Connection Error",
        "Could not send your message. Please check your internet connection and try again."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const send = sendMessage;

  const handleQuickReply = (reply) => {
    setInput(reply);
  };

  const fetchConversationHistory = async () => {
    if (!userId) {
      console.log("No userId available for fetching history");
      return;
    }
    
    try {
      setLoadingHistory(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please log in to view chat history.");
        setLoadingHistory(false);
        return;
      }

      const url = `${API_BASE_URL}/api/chatbot/session/${userId}/history/`;
      console.log("Fetching conversation history from:", url);
      console.log("Using userId:", userId);
      console.log("Token exists:", !!token);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch((networkError) => {
        console.error("Network error:", networkError);
        throw new Error(`Network error: ${networkError.message || "Could not reach server"}`);
      });

      console.log("History response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("History data received:", data);
        
        if (data.messages && data.messages.length > 0) {
          // Group messages into conversations by date
          const groupedConversations = groupMessagesByDate(data.messages);
          setConversationHistory(groupedConversations);
        } else {
          setConversationHistory([]);
        }
      } else {
        // Try to get error message from response
        let errorMessage = "Failed to load history";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
          console.error("History API error:", errorData);
        } catch (e) {
          console.error("Could not parse error response:", e);
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      console.error("Error details:", {
        message: error.message,
        userId: userId,
        apiUrl: API_BASE_URL,
      });
      
      // Handle different error cases
      if (error.message.includes("404") || error.message.includes("not found")) {
        // No history found - this is okay, just show empty state
        setConversationHistory([]);
      } else if (error.message.includes("401") || error.message.includes("Authentication")) {
        // Authentication error
        Alert.alert(
          "Authentication Error", 
          "Please log in again to view your chat history."
        );
        setConversationHistory([]);
      } else if (error.message.includes("Network error") || error.message.includes("fetch")) {
        // Network error
        Alert.alert(
          "Connection Error", 
          "Could not connect to the server. Please check your internet connection and try again."
        );
        setConversationHistory([]);
      } else {
        // Other errors - show message but don't block the UI
        console.warn("History fetch error (non-critical):", error.message);
        setConversationHistory([]);
        // Only show alert for critical errors
        if (!error.message.includes("empty") && !error.message.includes("No messages")) {
          Alert.alert(
            "Error", 
            `Could not load chat history: ${error.message || "Please try again later."}`
          );
        }
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const groupMessagesByDate = (messages) => {
    // Group messages by day (Today, Yesterday, Earlier)
    // Each day = ONE conversation (all messages from that day together)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groupedByDay = {
      today: [],
      yesterday: [],
      earlier: {},
    };
    
    // Sort messages by date (oldest first)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    sortedMessages.forEach((msg) => {
      const messageDate = new Date(msg.created_at);
      messageDate.setHours(0, 0, 0, 0);
      
      if (messageDate.getTime() === today.getTime()) {
        groupedByDay.today.push(msg);
      } else if (messageDate.getTime() === yesterday.getTime()) {
        groupedByDay.yesterday.push(msg);
      } else {
        // Group by actual date for earlier messages
        const dateKey = messageDate.toISOString().split('T')[0];
        if (!groupedByDay.earlier[dateKey]) {
          groupedByDay.earlier[dateKey] = [];
        }
        groupedByDay.earlier[dateKey].push(msg);
      }
    });
    
    // Build result with day sections - each day is ONE conversation
    const result = [];
    
    // Today - all messages from today as one conversation
    if (groupedByDay.today.length > 0) {
      result.push({
        type: 'section',
        label: 'Today',
        date: today,
        conversations: [{
          id: `conv-today-${today.toISOString()}`,
          messages: groupedByDay.today,
          date: new Date(groupedByDay.today[0].created_at),
          preview: getConversationPreview(groupedByDay.today),
        }],
      });
    }
    
    // Yesterday - all messages from yesterday as one conversation
    if (groupedByDay.yesterday.length > 0) {
      result.push({
        type: 'section',
        label: 'Yesterday',
        date: yesterday,
        conversations: [{
          id: `conv-yesterday-${yesterday.toISOString()}`,
          messages: groupedByDay.yesterday,
          date: new Date(groupedByDay.yesterday[0].created_at),
          preview: getConversationPreview(groupedByDay.yesterday),
        }],
      });
    }
    
    // Earlier - each date is one conversation
    const sortedEarlierDates = Object.keys(groupedByDay.earlier).sort().reverse();
    
    sortedEarlierDates.forEach((dateKey) => {
      const date = new Date(dateKey);
      const dayMessages = groupedByDay.earlier[dateKey];
      
      result.push({
        type: 'section',
        label: date.toLocaleDateString("en-US", { 
          month: "long", 
          day: "numeric", 
          year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined 
        }),
        date: date,
        conversations: [{
          id: `conv-${dateKey}`,
          messages: dayMessages,
          date: new Date(dayMessages[0].created_at),
          preview: getConversationPreview(dayMessages),
        }],
      });
    });
    
    return result;
  };

  const getConversationPreview = (messages) => {
    // Get first user message and first bot response
    const userMessage = messages.find(m => m.role === "user");
    const botMessage = messages.find(m => m.role === "assistant");
    
    if (userMessage && botMessage) {
      return {
        user: userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? "..." : ""),
        bot: botMessage.content.substring(0, 80) + (botMessage.content.length > 80 ? "..." : ""),
      };
    }
    return { user: "", bot: "" };
  };

  const handleOpenHistory = () => {
    setShowHistory(true);
    fetchConversationHistory();
  };

  const handleSelectConversation = (conversation) => {
    // Load the selected conversation into the chat
    const formattedMessages = conversation.messages.map((msg) => ({
      id: msg.id.toString(),
      author: msg.role === "user" ? "me" : "bot",
      name: msg.role === "user" ? "You" : "Nia",
      text: msg.content,
      createdAt: msg.created_at,
    }));
    setMessages(formattedMessages);
    setConversationStarted(true);
    setShowHistory(false);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleNewChat = async () => {
    // Clear current messages and start fresh
    setMessages([]);
    setInput("");
    setConversationStarted(false);
    setShowHistory(false);
    
    // Start a new conversation
    await startConversation();
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hey, I'm Here for You</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hey, I'm Here for You</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleOpenHistory} hitSlop={10} style={styles.historyButton}>
            <Feather name="clock" size={18} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} hitSlop={10} style={styles.calendarButton}>
            <Feather name="calendar" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={ms(10)}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => {
            const mine = m.author === "me";
            return (
              <View key={m.id} style={{ marginBottom: spacing.lg }}>
                {/* Name above bubble */}
                <Text
                  style={[
                    styles.name,
                    { textAlign: mine ? "right" : "left", color: colors.accent },
                  ]}
                >
                  {m.name}
                </Text>

                <View
                  style={[
                    styles.row,
                    { justifyContent: mine ? "flex-end" : "flex-start" },
                  ]}
                >
                  {/* Avatar circle (icon) */}
                  {!mine && (
                    <View style={[styles.avatar, { marginRight: spacing.sm }]}>
                      <Feather name="user" size={16} color={colors.text} />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.myBubble : styles.botBubble,
                    ]}
                  >
                    <Text style={[type.body, { color: mine ? colors.white : colors.text }]}>
                      {m.text}
                    </Text>
                  </View>

                  {mine && (
                    <View style={[styles.avatar, { marginLeft: spacing.sm }]}>
                      <Feather name="user" size={16} color={colors.text} />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[styles.name, { textAlign: "left", color: colors.accent }]}>
                Nia
              </Text>
              <View style={[styles.row, { justifyContent: "flex-start" }]}>
                <View style={[styles.avatar, { marginRight: spacing.sm }]}>
                  <Feather name="user" size={16} color={colors.text} />
                </View>
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        {messages.length <= 1 && conversationStarted && (
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

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.accent}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity onPress={send} style={styles.sendBtn} hitSlop={10}>
            <Feather name="send" size={18} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.micBtn} hitSlop={10}>
            <Feather name="mic" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowHistory(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={styles.historyHeader}>
            <View style={styles.historyHeaderLeft}>
              <Text style={styles.historyTitle}>Chat History</Text>
            </View>
            <View style={styles.historyHeaderRight}>
              <TouchableOpacity 
                onPress={handleNewChat} 
                hitSlop={10} 
                style={styles.newChatButton}
              >
                <Feather name="plus" size={18} color={colors.white} />
                <Text style={styles.newChatButtonText}>New Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowHistory(false)} hitSlop={10}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {loadingHistory ? (
            <View style={styles.historyLoadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.historyLoadingText}>Loading history...</Text>
            </View>
          ) : conversationHistory.length === 0 ? (
            <View style={styles.historyEmptyContainer}>
              <Feather name="message-circle" size={48} color={colors.accent} style={{ opacity: 0.3 }} />
              <Text style={styles.historyEmptyText}>No conversation history yet</Text>
              <Text style={styles.historyEmptySubtext}>Start chatting to see your history here</Text>
            </View>
          ) : (
            <FlatList
              data={conversationHistory.flatMap((section) => [
                { type: 'section-header', id: `header-${section.label}`, label: section.label },
                ...section.conversations.map((conv) => ({ ...conv, sectionLabel: section.label })),
              ])}
              keyExtractor={(item) => item.id || item.type}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                if (item.type === 'section-header') {
                  return (
                    <View style={styles.historySectionHeader}>
                      <Text style={styles.historySectionHeaderText}>{item.label}</Text>
                    </View>
                  );
                }
                
                return (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => handleSelectConversation(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemIcon}>
                        <Feather name="message-circle" size={16} color={colors.accent} />
                      </View>
                      <Text style={styles.historyItemTime}>
                        {item.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </Text>
                    </View>
                    {item.preview.user && (
                      <Text style={styles.historyItemPreview} numberOfLines={1}>
                        <Text style={styles.historyItemPreviewLabel}>You: </Text>
                        {item.preview.user}
                      </Text>
                    )}
                    {item.preview.bot && (
                      <Text style={styles.historyItemPreview} numberOfLines={2}>
                        <Text style={styles.historyItemPreviewLabel}>Nia: </Text>
                        {item.preview.bot}
                      </Text>
                    )}
                    <View style={styles.historyItemFooter}>
                      <Text style={styles.historyItemCount}>
                        {item.messages.length} {item.messages.length === 1 ? "message" : "messages"}
                      </Text>
                      <Feather name="chevron-right" size={16} color={colors.accent} />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.md,
  },
  headerTitle: { ...type.h2, color: colors.text },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  historyButton: {
    backgroundColor: "#6B7280",
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: spacing.sm,
  },
  calendarButton: {
    backgroundColor: "#4285F4",
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  thread: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  name: { ...type.caption, marginBottom: spacing.xs },
  row: { flexDirection: "row", alignItems: "flex-end" },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFE7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  bubble: {
    maxWidth: "70%",
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  botBubble: {
    backgroundColor: "#EBDDFF", // light lavender (matches your UI)
    borderTopLeftRadius: 6,
  },
  myBubble: {
    backgroundColor: colors.accent,
    borderTopRightRadius: 6,
  },

  composer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: "#EBDDFF",
    color: colors.text,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(10),
    ...type.body,
    maxHeight: ms(110),
  },
  sendBtn: {
    backgroundColor: colors.accent,
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: "center",
    justifyContent: "center",
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999999",
    marginHorizontal: 2,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  quickRepliesContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  quickReplies: {
    flexDirection: "row",
  },
  quickReplyButton: {
    backgroundColor: "#F8F8F8",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quickReplyText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  loadingText: {
    ...type.body,
    color: colors.accent,
    marginTop: spacing.md,
  },
  // History Modal Styles
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  historyHeaderLeft: {
    flex: 1,
  },
  historyHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTitle: {
    ...type.h2,
    color: colors.text,
    fontWeight: "700",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
  newChatButtonText: {
    ...type.caption,
    color: colors.white,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  historyLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  historyLoadingText: {
    ...type.body,
    color: colors.accent,
    marginTop: spacing.md,
  },
  historyEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing.xl,
  },
  historyEmptyText: {
    ...type.h3,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  historyEmptySubtext: {
    ...type.body,
    color: colors.accent,
    marginTop: spacing.sm,
    textAlign: "center",
    opacity: 0.7,
  },
  historyList: {
    padding: spacing.xl,
  },
  historyItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  historyItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EBDDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  historyItemDate: {
    ...type.caption,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  historyItemTime: {
    ...type.caption,
    color: colors.accent,
    opacity: 0.7,
  },
  historyItemPreview: {
    ...type.body,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  historyItemPreviewLabel: {
    fontWeight: "600",
    color: colors.accent,
  },
  historyItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  historyItemCount: {
    ...type.caption,
    color: colors.accent,
    opacity: 0.7,
  },
  historySectionHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginTop: spacing.md,
  },
  historySectionHeaderText: {
    ...type.h3,
    color: colors.text,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
