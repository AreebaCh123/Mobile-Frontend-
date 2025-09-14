// src/screens/Tasks.js
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

/** ----- mock data ----- */
const TODAY = [
  { id: "t1", title: "Do deep breathing for 10 minutes", due: "9:00 AM" },
  { id: "t2", title: "Journal about your feelings", due: "11:00 AM" },
  { id: "t3", title: "Listen to calming music", due: "1:00 PM" },
  { id: "t4", title: "Practice mindfulness meditation", due: "3:00 PM" },
  { id: "t5", title: "Review therapy notes", due: "5:00 PM" },
];

const THIS_WEEK = [
  ...TODAY,
  { id: "w6", title: "Call a friend", due: "Tomorrow 4:00 PM" },
  { id: "w7", title: "Go for a mindful walk", due: "Fri 6:30 PM" },
];

export default function Tasks({ navigation }) {
  const [tab, setTab] = useState("today"); // JS (no TS union)
  const [done, setDone] = useState({});    // JS (no Record type)

  const data = useMemo(() => (tab === "today" ? TODAY : THIS_WEEK), [tab]);

  const toggle = (id) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }) => {
    const completed = !!done[item.id];
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggle(item.id)}
        style={styles.row}
      >
        {/* faux checkbox */}
        <View style={[styles.box, completed && styles.boxOn]}>
          {completed && <Feather name="check" size={14} color={colors.white} />}
        </View>

        {/* text */}
        <View style={styles.rowText}>
          <Text
            style={[
              styles.title,
              completed && { textDecorationLine: "line-through", opacity: 0.6 },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={styles.subtitle}>Due {item.due}</Text>
        </View>

        {/* status dot (green) */}
        <View
          style={[
            styles.dot,
            completed && { backgroundColor: "#D1D5DB" }, // gray when done
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tasks</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddTask")}
          hitSlop={10}
          accessibilityLabel="Add task"
        >
          <Feather name="plus" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrap}>
        <Segment
          label="Today"
          active={tab === "today"}
          onPress={() => setTab("today")}
        />
        <Segment
          label="This Week"
          active={tab === "week"}
          onPress={() => setTab("week")}
        />
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: spacing["3xl"],
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Medications button */}
      <View style={styles.medButtonContainer}>
        <TouchableOpacity
          style={styles.medBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Medications")}
        >
          <Text style={styles.medText}>Medications</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/** small segment button */
function Segment({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.segment, active && styles.segmentActive]}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const BOX = ms(22);

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

  segmentWrap: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  segment: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: ms(8),
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: '#2D5A27',
    borderColor: '#2D5A27',
  },
  segmentText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  segmentTextActive: { color: "#fff" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  box: {
    width: BOX,
    height: BOX,
    borderRadius: ms(6),
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  boxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rowText: { flex: 1 },
  title: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: 2 },
  subtitle: { ...type.caption, color: colors.accent },

  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: "#10B981",
    marginLeft: spacing.md,
  },

  medButtonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  medBtn: {
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    paddingHorizontal: ms(20),
    paddingVertical: ms(12),
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  medText: { ...type.body, color: "#fff", fontWeight: "700" },
});
