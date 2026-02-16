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
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import EventSource from "react-native-sse";

// Gracefully handle missing speech recognition (for Expo Go compatibility)
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = () => {}; // No-op hook
let isSpeechAvailable = false;

try {
  const speechModule = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  isSpeechAvailable = true;
} catch (e) {
  console.log("Speech recognition not available (running in Expo Go)");
}

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";
const LIBRE_TRANSLATE_URL = "https://libretranslate.com/translate";

// Detect if text contains Arabic/Urdu script (Urdu uses Arabic script)
function isUrduOrArabicText(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Arabic Unicode block (includes Urdu additional chars in the same range)
  const arabicUrduRegex = /[\u0600-\u06FF]/;
  return arabicUrduRegex.test(trimmed);
}

// Translate Urdu (or Arabic) to English via LibreTranslate (free, no API key)
async function translateUrduToEnglish(text) {
  const res = await fetch(LIBRE_TRANSLATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "ur",
      target: "en",
      format: "text",
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Translation failed: ${res.status}`);
  }
  const data = await res.json();
  return data.translatedText ?? text;
}

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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(null); // null = not checked yet, true/false after check
  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animated dots for typing indicator
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Typing dots animation
  useEffect(() => {
    if (isTyping) {
      const animateDots = () => {
        Animated.loop(
          Animated.stagger(150, [
            Animated.sequence([
              Animated.timing(dot1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(dot1Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(dot2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(dot2Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(dot3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(dot3Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]),
          ])
        ).start();
      };
      animateDots();
    } else {
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [isTyping]);

  const quickReplies = [
    "I'm feeling anxious",
    "I'm having a tough day",
    "I need some support",
    "I'm feeling better",
    "Can you help me relax?",
  ];

  // Speech recognition event handlers with Urdu support and press-and-hold UX
  useSpeechRecognitionEvent("start", () => {
    setIsRecording(true);
    setTranscript("");
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  });

  useSpeechRecognitionEvent("nomatch", () => {
    setIsRecording(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  });

  useSpeechRecognitionEvent("result", async (event) => {
    // Get the latest transcript
    const results = event?.results ?? [];
    const latestTranscript = results.length > 0
      ? results.map((r) => r.transcript ?? "").filter(Boolean).join(" ").trim()
      : "";
    if (!latestTranscript) return;
    
    setTranscript(latestTranscript);
    
    // Check if Urdu/Arabic and translate if needed
    if (isUrduOrArabicText(latestTranscript)) {
      setIsTranslating(true);
      try {
        const translated = await translateUrduToEnglish(latestTranscript);
        setTranscript(translated);
      } catch (err) {
        console.error("Translation failed:", err);
        // Keep original transcript if translation fails
      } finally {
        setIsTranslating(false);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsRecording(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    
    const code = event?.error ?? "unknown";
    const msg = event?.message ?? "";
    if (code === "aborted") return;
    
    const userMessage =
      code === "not-allowed" || code === "permission-denied"
        ? "Microphone permission is required to use voice input."
        : code === "no-speech" || code === "speech-timeout"
          ? "No speech detected. Please try again."
          : code === "network"
            ? "Speech recognition needs internet. Check your connection."
            : code === "language-not-supported"
              ? "This language is not supported for recognition."
              : msg || "Voice input failed. Please try again.";
    
    if (code !== "no-speech") {
      Alert.alert("Voice input", userMessage);
    }
  });

  // Check on mount if speech recognition is available (e.g. not in Expo Go)
  useEffect(() => {
    if (!ExpoSpeechRecognitionModule?.isRecognitionAvailable) {
      setSpeechAvailable(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const available = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
        if (mounted) setSpeechAvailable(!!available);
      } catch (_) {
        if (mounted) setSpeechAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cleanup: stop recognition on unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (ExpoSpeechRecognitionModule) {
        try {
          ExpoSpeechRecognitionModule.stop();
          ExpoSpeechRecognitionModule.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Start voice recording (called on press in)
  const startVoiceRecording = async () => {
    if (speechAvailable === false || !ExpoSpeechRecognitionModule) {
      Alert.alert(
        "Voice input in Expo Go",
        "Voice input is not available in Expo Go. To test the mic:\n\n• Web: run \"npx expo start --web\" and open in Chrome\n• Device: run \"npx expo run:ios\" or \"npx expo run:android\" to create a development build"
      );
      return;
    }
    
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone access",
          "Please allow microphone access in Settings to use voice input."
        );
        return;
      }
      
      const available = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!available) {
        Alert.alert(
          "Not available",
          "Speech recognition is not available on this device."
        );
        return;
      }
      
      ExpoSpeechRecognitionModule.start({
        lang: "ur-PK", // Urdu language support
        interimResults: true,
        continuous: true,
      });
    } catch (err) {
      console.error("Start recognition:", err);
      const msg = err?.message ?? "";
      const isExpoGoOrMissing = /expo go|native module|not found|undefined/i.test(msg);
      Alert.alert(
        "Voice input",
        isExpoGoOrMissing
          ? "Voice input is not available in Expo Go. To test: run \"npx expo start --web\" (Chrome) or \"npx expo run:ios\" / \"npx expo run:android\" for a development build."
          : "Could not start speech recognition. Please try again."
      );
    }
  };

  // Stop voice recording and send message (called on press out)
  const stopVoiceRecordingAndSend = async () => {
    try {
      ExpoSpeechRecognitionModule.stop();

      // Explicitly reset recording state immediately to ensure UI updates
      setIsRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      // Small delay to ensure we have the final transcript
      setTimeout(() => {
        if (transcript.trim()) {
          // Set the transcript as input and send
          setInput(transcript.trim());
          // Trigger send after setting input
          setTimeout(() => {
            sendMessageWithText(transcript.trim());
          }, 100);
        }
        setTranscript("");
      }, 200);
    } catch (error) {
      console.error("Error stopping voice recording:", error);
      setIsRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      setTranscript("");
    }
  };

  // Send message with specific text (for voice input)
  const sendMessageWithText = async (text) => {
    if (!text || !userId) return;

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now().toString(),
      author: "me",
      name: "You",
      text: text,
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

      // Use EventSource for proper SSE streaming
      const es = new EventSource(`${API_BASE_URL}/api/chatbot/message/`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify({
          message: text,
          user_name: userName,
        }),
        pollingInterval: 0, // Disable polling, use true streaming
      });

      const listener = (event) => {
        if (event.type === "open") {
          console.log("SSE connection opened");
        } else if (event.type === "message") {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "token") {
              // Append token to bot message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: msg.text + data.content }
                    : msg
                )
              );
              scrollRef.current?.scrollToEnd({ animated: false });
            } else if (data.type === "done") {
              console.log("Streaming complete");
              es.close();
              setIsTyping(false);
            } else if (data.type === "error") {
              console.error("Stream error:", data.content);
              es.close();
              setIsTyping(false);
              // Update with error message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." }
                    : msg
                )
              );
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        } else if (event.type === "error") {
          console.error("SSE connection error:", event.message);
          es.close();
          setIsTyping(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: "I'm sorry, I'm having trouble connecting right now. Please try again." }
                : msg
            )
          );
        } else if (event.type === "exception") {
          console.error("SSE exception:", event.message, event.error);
          es.close();
          setIsTyping(false);
        }
      };

      es.addEventListener("open", listener);
      es.addEventListener("message", listener);
      es.addEventListener("error", listener);

      // Clean up on unmount
      return () => {
        es.removeAllEventListeners();
        es.close();
      };
    } catch (error) {
      console.error("Error sending message:", error);
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

      // Use EventSource for proper SSE streaming
      const es = new EventSource(`${API_BASE_URL}/api/chatbot/message/`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify({
          message: trimmed,
          user_name: userName,
        }),
        pollingInterval: 0, // Disable polling, use true streaming
      });

      const listener = (event) => {
        if (event.type === "open") {
          console.log("SSE connection opened");
        } else if (event.type === "message") {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "token") {
              // Append token to bot message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: msg.text + data.content }
                    : msg
                )
              );
              scrollRef.current?.scrollToEnd({ animated: false });
            } else if (data.type === "done") {
              console.log("Streaming complete");
              es.close();
              setIsTyping(false);
            } else if (data.type === "error") {
              console.error("Stream error:", data.content);
              es.close();
              setIsTyping(false);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." }
                    : msg
                )
              );
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        } else if (event.type === "error") {
          console.error("SSE connection error:", event.message);
          es.close();
          setIsTyping(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: "I'm sorry, I'm having trouble connecting right now. Please try again." }
                : msg
            )
          );
        } else if (event.type === "exception") {
          console.error("SSE exception:", event.message, event.error);
          es.close();
          setIsTyping(false);
        }
      };

      es.addEventListener("open", listener);
      es.addEventListener("message", listener);
      es.addEventListener("error", listener);

      // Clean up on unmount
      return () => {
        es.removeAllEventListeners();
        es.close();
      };
    } catch (error) {
      console.error("Error sending message:", error);
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
          <TouchableOpacity onPress={() => { }} hitSlop={10} style={styles.calendarButton}>
            <Feather name="calendar" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? ms(10) : 0}
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
                <View
                  style={[
                    styles.row,
                    { justifyContent: mine ? "flex-end" : "flex-start" },
                  ]}
                >
                  {/* Bot avatar with name above */}
                  {!mine && (
                    <View style={styles.avatarContainer}>
                      <Text style={[styles.name, { color: colors.accent }]}>
                        {m.name}
                      </Text>
                      <View style={[styles.avatar, { marginRight: spacing.sm }]}>
                        <Feather name="user" size={16} color={colors.text} />
                      </View>
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

                  {/* User avatar with name above */}
                  {mine && (
                    <View style={styles.avatarContainer}>
                      <Text style={[styles.name, { color: colors.accent, textAlign: "center" }]}>
                        {m.name}
                      </Text>
                      <View style={[styles.avatar, { marginLeft: spacing.sm }]}>
                        <Feather name="user" size={16} color={colors.text} />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={[styles.row, { justifyContent: "flex-start" }]}>
                <View style={styles.avatarContainer}>
                  <Text style={[styles.name, { color: colors.accent }]}>
                    Nia
                  </Text>
                  <View style={[styles.avatar, { marginRight: spacing.sm }]}>
                    <Feather name="user" size={16} color={colors.text} />
                  </View>
                </View>
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    <Animated.View style={[styles.typingDot, { transform: [{ scale: dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }]} />
                    <Animated.View style={[styles.typingDot, { transform: [{ scale: dot2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }]} />
                    <Animated.View style={[styles.typingDot, { transform: [{ scale: dot3Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }]} />
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
          {/* Recording indicator overlay */}
          {isRecording && (
            <View style={styles.recordingOverlay}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  {transcript || "Listening..."}
                </Text>
              </View>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder={isRecording ? "Listening..." : "Type a message..."}
            placeholderTextColor={colors.accent}
            value={isRecording ? transcript : input}
            onChangeText={setInput}
            multiline
            editable={!isRecording && !isTranslating}
          />
          <TouchableOpacity onPress={send} style={styles.sendBtn} hitSlop={10}>
            <Feather name="send" size={18} color={colors.white} />
          </TouchableOpacity>

          {/* Voice input button with press-and-hold - only show if speech is available */}
          {isSpeechAvailable && (
            <Animated.View
              style={[
                styles.micBtn,
                (isRecording || isTranslating) && styles.micBtnRecording,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                onPressIn={startVoiceRecording}
                onPressOut={stopVoiceRecordingAndSend}
                style={styles.micBtnInner}
                hitSlop={10}
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Feather
                    name="mic"
                    size={18}
                    color={isRecording ? colors.white : colors.accent}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
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
  avatarContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
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
  micBtnActive: {
    backgroundColor: colors.accent,
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
  // Voice recording styles
  micBtnRecording: {
    backgroundColor: colors.accent,
  },
  micBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingOverlay: {
    position: "absolute",
    top: -60,
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.95)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4444",
    marginRight: spacing.sm,
  },
  recordingText: {
    ...type.body,
    color: colors.white,
    flex: 1,
  },
});
