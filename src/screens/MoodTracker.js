import React, { useState, useEffect, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider"; // expo installs this
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

const MOODS = [
  { key: "happy", label: "Happy", emoji: "😊" },
  { key: "excited", label: "Excited", emoji: "🤩" },
  { key: "content", label: "Content", emoji: "☺️" },
  { key: "relaxed", label: "Relaxed", emoji: "😌" },
  { key: "neutral", label: "Neutral", emoji: "😐" },
  { key: "tired", label: "Tired", emoji: "😴" },
  { key: "sad", label: "Sad", emoji: "😢" },
  { key: "anxious", label: "Anxious", emoji: "🙂" },
  { key: "angry", label: "Angry", emoji: "😠" },
];

export default function MoodTracker({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;

  useEffect(() => {
    AsyncStorage.getItem("authToken").then(setAuthToken).catch(() => {});
  }, []);

  const onSave = async () => {
    if (!selected) {
      Alert.alert("Pick a mood", "Please select your current mood.");
      return;
    }
    if (!authToken) {
      Alert.alert("Session expired", "Please log in again.");
      return;
    }
    setSaving(true);
    const moodMeta = MOODS.find((m) => m.key === selected);
    try {
      const response = await fetch(`${API_BASE_URL}/api/journals/moods/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          mood_label: moodMeta?.label || selected,
          mood_score: intensity,
          note: note.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null
            ? Object.values(data)[0]
            : "Unable to save mood. Please try again.";
        Alert.alert("Not saved", Array.isArray(message) ? message.join("\n") : message);
        return;
      }

      Alert.alert("Saved", `Mood: ${moodMeta?.label} • Intensity: ${intensity}/10`, [
        {
          text: "OK",
          onPress: () => {
            setNote("");
          },
        },
      ]);
    } catch (error) {
      console.log("Mood save error:", error);
      Alert.alert(
        "Network error",
        "Could not reach the server. Make sure your backend is running and the URL is correct."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
            hitSlop={10}
          >
            <Feather name="x" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            How are you feeling today?
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.sectionLead}>Select your mood</Text>

        {/* Mood grid */}
        <View style={styles.grid}>
          {MOODS.map((m) => {
            const active = selected === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={styles.cell}
                onPress={() => setSelected(m.key)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.emojiWrap,
                    active && styles.emojiWrapActive,
                  ]}
                >
                  <Text style={styles.emoji}>{m.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.cellLabel,
                    active && { color: colors.text, fontWeight: "700" },
                  ]}
                  numberOfLines={1}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Intensity */}
        <Text style={styles.intensityLabel}>
          Mood intensity (0–10) <Text style={{ color: colors.mutedText }}>{intensity}</Text>
        </Text>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          minimumValue={0}
          maximumValue={10}
          step={1}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor="#E5E5EA"
          thumbTintColor={colors.accent}
          style={{ marginHorizontal: spacing.xl }}
        />

        {/* Note */}
        <TextInput
          style={styles.note}
          placeholder="Write something related to your mood today…"
          placeholderTextColor={colors.accent}
          multiline
          value={note}
          onChangeText={setNote}
          textAlignVertical="top"
        />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save Mood"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => navigation.navigate("MoodHistory")} // add this screen if you have it
          >
            <Text style={styles.historyText}>View Mood History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CIRCLE = ms(66);

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

  sectionLead: {
    ...type.body,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
  cell: {
    width: "45%",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  emojiWrap: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: "#F3ECFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8DAFF",
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiWrapActive: {
    backgroundColor: "#F7E8F9",
    borderColor: colors.accent,
  },
  emoji: { fontSize: ms(28) },
  cellLabel: { ...type.caption, color: colors.mutedText },

  intensityLabel: {
    ...type.caption,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  note: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    height: ms(110),
    backgroundColor: "#EBDDFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...type.body,
    color: colors.text,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(12),
  },
  saveText: { ...type.body, color: "#fff", fontWeight: "700" },

  historyBtn: {
    flex: 1,
    backgroundColor: "#E6D9F6",
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(12),
  },
  historyText: { ...type.body, color: colors.accent, fontWeight: "700" },
});
