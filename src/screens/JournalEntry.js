// src/screens/JournalEntry.js
import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";
const DEFAULT_SOURCE_TYPE = "text";

export default function JournalEntry({ navigation }) {
  const [entry, setEntry] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savedEntry, setSavedEntry] = useState(null);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;

  useEffect(() => {
    AsyncStorage.getItem("authToken").then(setAuthToken).catch(() => {});
  }, []);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("HomeTab");
  };

  const handleTextChange = (text) => {
    setEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
    if (savedEntry) {
      setSavedEntry(null);
    }
  };

  const saveEntry = async () => {
    if (!entry.trim()) return;
    if (!authToken) {
      Alert.alert("Session expired", "Please log in again.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/journals/entries/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: entry.trim(),
          source_type: DEFAULT_SOURCE_TYPE,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data === "object" ? Object.values(data)[0] : "Unable to save journal entry."
        );
      }
      setSavedEntry(data.entry);
      Alert.alert("Saved", "Journal entry created successfully.");
    } catch (error) {
      console.log("Save journal error:", error);
      Alert.alert("Error", error.message || "Unable to save journal entry.");
    } finally {
      setSaving(false);
    }
  };

  const shareEntry = async () => {
    if (!savedEntry) return;
    if (savedEntry.shared_with_doctor) return;
    setSharing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/journals/entries/${savedEntry.id}/share/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ shared: true }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data === "object" ? Object.values(data)[0] : "Unable to share journal entry."
        );
      }
      setSavedEntry(data.entry);
      Alert.alert("Shared", "Journal entry shared with your doctor.");
    } catch (error) {
      console.log("Share journal error:", error);
      Alert.alert("Error", error.message || "Unable to share journal entry.");
    } finally {
      setSharing(false);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const disableSave = !entry.trim() || saving || !authToken;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={10} onPress={goBack}>
            <Feather name="arrow-left" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Journal Entry</Text>
          <TouchableOpacity
            style={[styles.saveButtonContainer, disableSave && styles.saveButtonDisabled]}
            onPress={saveEntry}
            disabled={disableSave}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={[styles.saveButtonText, disableSave && styles.saveButtonTextDisabled]}>
                Save Entry
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.metaContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={16} color={colors.primary} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </TouchableOpacity>
          <Text style={styles.wordCount}>{wordCount} words</Text>
        </View>

        <View style={styles.entryContainer}>
          <TextInput
            style={styles.entryBox}
            multiline
            placeholder="Reflect on your thoughts, feelings, and experiences today..."
            placeholderTextColor={colors.mutedText}
            value={entry}
            onChangeText={(text) => handleTextChange(text)}
            textAlignVertical="top"
            maxLength={4000}
          />
          <View style={styles.entryFooter}>
          <Text style={styles.characterCount}>{entry.length}/4000 • Text</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("JournalHistory")}
          >
            <Feather name="book-open" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>

          {savedEntry && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                savedEntry.shared_with_doctor && styles.actionButtonDisabled,
              ]}
              onPress={shareEntry}
              disabled={sharing || savedEntry.shared_with_doctor}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Feather
                  name="share-2"
                  size={18}
                  color={savedEntry.shared_with_doctor ? colors.mutedText : colors.primary}
                />
              )}
              <Text
                style={[
                  styles.actionButtonText,
                  savedEntry.shared_with_doctor && { color: colors.mutedText },
                ]}
              >
                {savedEntry.shared_with_doctor ? "Shared" : "Share with Doctor"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "default" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setSelectedDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing["3xl"],
    paddingTop: spacing["3xl"],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...type.h2,
    color: colors.text,
    fontWeight: "600",
  },
  saveButtonContainer: {
    backgroundColor: "#2D5A27",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    shadowColor: "#2D5A27",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    minWidth: ms(110),
    alignItems: "center",
  },
  saveButtonText: {
    ...type.body,
    color: colors.white,
    fontWeight: "700",
  },
  saveButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonTextDisabled: {
    color: colors.mutedText,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    ...type.caption,
    color: colors.text,
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  wordCount: {
    ...type.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  entryContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    shadowColor: "#BF8EEB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryBox: {
    minHeight: ms(220),
    padding: spacing.lg,
    color: colors.text,
    ...type.body,
    lineHeight: 22,
  },
  entryFooter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#FAFAFA",
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  characterCount: {
    ...type.caption,
    color: colors.mutedText,
    textAlign: "right",
  },
  actionsContainer: {
    flexDirection: "column",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#BF8EEB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    ...type.caption,
    color: colors.text,
    fontWeight: "500",
    marginLeft: spacing.sm,
  },
});
