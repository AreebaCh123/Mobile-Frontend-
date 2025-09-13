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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function JournalEntry({ navigation }) {
  const [entry, setEntry] = useState("");

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("HomeTab");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={10} onPress={goBack}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Today's Journal</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.subTitle}>July 24, 2024, 10:30 AM</Text>

        {/* Entry box */}
        <TextInput
          style={styles.entryBox}
          multiline
          placeholder="What's on your mind today?"
          placeholderTextColor={colors.accent}
          value={entry}
          onChangeText={setEntry}
          textAlignVertical="top"
        />

        {/* small icons row */}
        <View style={styles.iconsRow}>
          <Feather name="mic" size={22} color={colors.text} />
          <Feather name="hash" size={22} color={colors.text} />
        </View>

        {/* Actions */}
        <View style={styles.actionsWrap}>
          <Pill onPress={() => { /* open mood labels */ }}>
            Add mood labels
          </Pill>

          <Pill onPress={() => navigation.navigate("JournalHistory")}>
            View journal history
          </Pill>

          <Pill onPress={() => { /* share flow */ }}>
            Share with Doctor
          </Pill>
        </View>
      </ScrollView>
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
  content: { padding: spacing.xl, paddingBottom: spacing["3xl"] },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: { ...type.h2, color: colors.text },
  subTitle: { ...type.caption, color: colors.accent, marginBottom: spacing.lg },
  entryBox: {
    minHeight: ms(150),
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    ...type.body,
  },
  iconsRow: {
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
    marginBottom: spacing.lg,
  },
  actionsWrap: {
    gap: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: ms(10),
    paddingHorizontal: ms(14),
  },
  pillText: { ...type.body, color: colors.white, fontWeight: "700" },
});
