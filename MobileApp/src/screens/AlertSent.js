// src/screens/AlertSent.js
import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function AlertSent({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl }}>
      {/* Close button */}
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Alert Sent</Text>

      <Image
        source={{ uri: "https://img.icons8.com/color/96/000000/ok--v1.png" }}
        style={styles.checkImg}
      />

      <Text style={styles.message}>
        Your emergency alert has been sent. Your therapist, Dr. Emily Carter, and your emergency
        contact Sarah Miller have been notified and your location was shared.
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.primaryText}>Return to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("Chatbot")}
      >
        <Text style={styles.secondaryText}>Talk to Chatbot</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { ...type.h2, textAlign: "center", marginVertical: spacing.lg },
  checkImg: { width: 120, height: 120, alignSelf: "center", marginBottom: spacing.lg },
  message: { ...type.body, textAlign: "center", marginBottom: spacing["2xl"], color: colors.text },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: ms(14),
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryText: { ...type.h3, color: colors.white },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: ms(14),
    alignItems: "center",
  },
  secondaryText: { ...type.h3, color: colors.primary },
});
