import React from "react";
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

export default function ExerciseDetail({ navigation, route }) {
  // exercise passed from SelfHelpTools
  const exercise = route?.params?.exercise ?? {
    title: "4-7-8 Breathing",
    duration: "2–3 min",
    steps: [
      "Inhale through your nose for 4 seconds. Imagine filling your lungs.",
      "Hold your breath for 7 seconds. Keep your body relaxed and still.",
      "Exhale slowly through your mouth for 8 seconds. Release all the air.",
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing["3xl"] }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{exercise.title}</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.duration}>{exercise.duration}</Text>

        <View style={styles.body}>
          <Text style={styles.intro}>
            This technique can help you relax and reduce stress. Follow the
            steps below to practice.
          </Text>

          {exercise.steps.map((s, i) => (
            <View key={i} style={{ marginTop: spacing.lg }}>
              <Text style={styles.stepHead}>Step {i + 1}</Text>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.cta} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>
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
  title: { ...type.h2, color: colors.text },

  duration: {
    ...type.caption,
    color: colors.accent,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  body: { paddingHorizontal: spacing.xl },
  intro: { ...type.body, color: colors.text, marginBottom: spacing.md },

  stepHead: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.xs },
  stepText: { ...type.body, color: colors.text },

  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: ms(12),
    alignItems: "center",
  },
  ctaText: { ...type.body, color: "#fff", fontWeight: "700" },
});
