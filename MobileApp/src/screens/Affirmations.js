import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

const AFFIRMATIONS = [
  "I am worthy of love and happiness.",
  "I am capable of achieving my goals.",
  "I am strong and resilient.",
  "I choose to focus on the positive.",
  "I am grateful for all the good in my life.",
  "I believe in myself and my abilities.",
  "I am worthy of success and abundance.",
  "I am at peace with who I am.",
  "I am surrounded by love and support.",
  "I am creating the life I desire.",
];

export default function Affirmations({ navigation }) {
  const [completed, setCompleted] = useState(new Set());

  const toggleCompletion = (index) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompleted(newCompleted);
  };

  const allCompleted = completed.size === AFFIRMATIONS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Affirmations</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Positive Affirmations</Text>
          <Text style={styles.introText}>
            Read through these affirmations and check off the ones that resonate with you today.
          </Text>
        </View>

        {/* Affirmations List */}
        <View style={styles.affirmationsContainer}>
          {AFFIRMATIONS.map((affirmation, index) => {
            const isCompleted = completed.has(index);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.affirmationCard, isCompleted && styles.affirmationCardCompleted]}
                onPress={() => toggleCompletion(index)}
                activeOpacity={0.8}
              >
                <View style={styles.affirmationContent}>
                  <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                    {isCompleted && <Feather name="check" size={16} color={colors.white} />}
                  </View>
                  <Text style={[styles.affirmationText, isCompleted && styles.affirmationTextCompleted]}>
                    {affirmation}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Completion Message */}
        {allCompleted && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>🎉 Great job!</Text>
            <Text style={styles.completionText}>
              You've completed all your daily affirmations. Keep up the positive mindset!
            </Text>
          </View>
        )}
      </ScrollView>
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

  introContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    ...type.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  introText: {
    ...type.body,
    color: colors.mutedText,
    lineHeight: 22,
  },

  affirmationsContainer: {
    paddingHorizontal: spacing.xl,
  },

  affirmationCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  affirmationCardCompleted: {
    backgroundColor: '#F0F9F0',
    borderColor: '#2D5A27',
  },

  affirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: '#2D5A27',
    borderColor: '#2D5A27',
  },

  affirmationText: {
    ...type.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  affirmationTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },

  completionContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#F0F9F0',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#2D5A27',
    alignItems: 'center',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    ...type.h2,
    color: '#2D5A27',
    marginBottom: spacing.sm,
  },
  completionText: {
    ...type.body,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 22,
  },
});
