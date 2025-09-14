// src/screens/JournalHistory.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";

const SECTIONS = [
  {
    title: "Today",
    data: [
      { id: "t1", title: "Reflecting on the day's challenges and", time: "10:30 AM" },
      { id: "t2", title: "Morning gratitude practice", time: "8:00 AM" },
    ],
  },
  {
    title: "Yesterday",
    data: [
      { id: "y1", title: "Evening reflections on personal growth", time: "9:45 PM" },
      { id: "y2", title: "Midday check-in and mood assessment", time: "11:15 AM" },
    ],
  },
];

export default function JournalHistory({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal History</Text>
        <View style={{ width: 22 }} />
      </View>

      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Journal", { entryId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.rowMeta}>{item.time}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9AA0A6" />
          </TouchableOpacity>
        )}
      />
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

  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
  },

  sectionTitle: {
    ...type.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },

  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    flexDirection: "row",
    alignItems: "center",
  },
  rowTitle: {
    ...type.body,
    color: colors.text,
    marginBottom: 4,
  },
  rowMeta: {
    ...type.caption,
    color: colors.accent,
  },

  separator: { height: spacing.md },
});
