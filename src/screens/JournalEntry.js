// src/screens/JournalEntry.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function JournalEntry({ navigation }) {
  const [entry, setEntry] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("HomeTab");
  };

  const handleTextChange = (text) => {
    setEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const saveEntry = () => {
    if (entry.trim()) {
      // TODO: Save to storage
      navigation.goBack();
    }
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Professional Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={10} onPress={goBack}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Journal Entry</Text>
          <TouchableOpacity 
            style={[styles.saveButtonContainer, !entry.trim() && styles.saveButtonDisabled]}
            onPress={saveEntry} 
            disabled={!entry.trim()}
          >
            <Text style={[styles.saveButtonText, !entry.trim() && styles.saveButtonTextDisabled]}>
              Save Entry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date and Word Count */}
        <View style={styles.metaContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={16} color={colors.primary} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </TouchableOpacity>
          <Text style={styles.wordCount}>{wordCount} words</Text>
        </View>

        {/* Professional Entry Box */}
        <View style={styles.entryContainer}>
          <TextInput
            style={styles.entryBox}
            multiline
            placeholder="Reflect on your thoughts, feelings, and experiences today..."
            placeholderTextColor={colors.mutedText}
            value={entry}
            onChangeText={handleTextChange}
            textAlignVertical="top"
            maxLength={2000}
          />
          <View style={styles.entryFooter}>
            <Text style={styles.characterCount}>{entry.length}/2000</Text>
          </View>
        </View>

        {/* Professional Action Buttons - Vertical Layout */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => { /* mood labels */ }}>
            <Feather name="heart" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>Mood Tags</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("JournalHistory")}>
            <Feather name="book-open" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => { /* share */ }}>
            <Feather name="share-2" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
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

function Pill({ children, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.pill}>
      <Text style={styles.pillText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { 
    padding: spacing.xl, 
    paddingBottom: spacing["3xl"],
    paddingTop: spacing['3xl'],
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
    fontWeight: '600',
  },
  saveButtonContainer: {
    backgroundColor: '#2D5A27',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  saveButtonText: {
    ...type.body,
    color: colors.white,
    fontWeight: '700',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonTextDisabled: {
    color: colors.mutedText,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  wordCount: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  entryContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryBox: {
    minHeight: ms(200),
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
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  characterCount: {
    ...type.caption,
    color: colors.mutedText,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  // Keep old styles for backward compatibility
  pill: {
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    paddingVertical: ms(10),
    paddingHorizontal: ms(14),
  },
  pillText: { ...type.body, color: colors.white, fontWeight: "700" },
});
