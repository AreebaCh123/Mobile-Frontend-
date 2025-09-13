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
    { id: "2", author: "me",  name: "Sophia", text: "hey" },
    { id: "3", author: "bot", name: "Nia", text: "how’re you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const mine = { id: Date.now().toString(), author: "me", name: "You", text: trimmed };
    setMessages((prev) => [...prev, mine]);
    setInput("");

    // very simple demo bot reply
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        author: "bot",
        name: "Nia",
        text:
          trimmed.toLowerCase().includes("sad") || trimmed.toLowerCase().includes("down")
            ? "I’m sorry you’re feeling that way. Would you like to try a quick breathing exercise?"
            : "Thanks for sharing. Tell me a bit more about what’s on your mind.",
      };
      setMessages((prev) => [...prev, reply]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 700);

    scrollRef.current?.scrollToEnd({ animated: true });
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
        </ScrollView>

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
});
