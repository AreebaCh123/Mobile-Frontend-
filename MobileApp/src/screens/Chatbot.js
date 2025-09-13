// src/screens/Chatbot.js
import React, { useRef, useState } from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function Chatbot({ navigation }) {
  const [messages, setMessages] = useState([
    { id: "1", author: "bot", name: "Nia", text: "Hi there! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const quickReplies = [
    "I'm feeling anxious",
    "I'm having a tough day", 
    "I need some support",
    "I'm feeling better",
    "Can you help me relax?",
  ];

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

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const mine = { id: Date.now().toString(), author: "me", name: "You", text: trimmed };
    setMessages((prev) => [...prev, mine]);
    setInput("");
    setIsTyping(true);

    // Generate intelligent AI response
    setTimeout(() => {
      const intelligentResponse = getAIResponse(trimmed);
      const reply = {
        id: (Date.now() + 1).toString(),
        author: "bot",
        name: "Nia",
        text: intelligentResponse,
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 1500 + Math.random() * 1000);

    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hey, I’m Here for You</Text>
        <View style={{ width: 22 }} />
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
        {messages.length <= 1 && (
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
});
