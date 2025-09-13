// src/screens/CrisisSupport.js
import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function CrisisSupport({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crisis Support</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Content */}
      <View style={styles.centerWrap}>
        <Text style={styles.bigTitle}>I Need Help</Text>
        <Text style={styles.desc}>
          This will immediately notify your therapist or emergency contact and share your location.
        </Text>

        <TouchableOpacity
          style={styles.alertBtn}
          onPress={() => navigation.navigate("AlertSent")}
        >
          <Text style={styles.alertBtnText}>Send Crisis Alert</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  headerTitle: { ...type.h2, color: colors.text },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  bigTitle: { ...type.h2, fontWeight: "700", marginBottom: spacing.lg },
  desc: { ...type.body, textAlign: "center", color: colors.text, marginBottom: spacing.xl },
  alertBtn: {
    backgroundColor: "#D0342C",
    borderRadius: radii.pill,
    paddingVertical: ms(14),
    paddingHorizontal: ms(24),
    width: "100%",
    alignItems: "center",
  },
  alertBtnText: { ...type.h3, color: colors.white, fontWeight: "700" },
});
