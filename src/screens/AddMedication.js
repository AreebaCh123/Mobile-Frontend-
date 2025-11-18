import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

const FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Once weekly",
  "Once monthly",
];

export default function AddMedication({ navigation }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [reminder, setReminder] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;

  const onSave = async () => {
    if (saving) return;
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/medications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          reminder_enabled: reminder,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.log("Create medication error:", data);
      }
      navigation.goBack();
    } catch (err) {
      console.log("Create medication network error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="x" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Add Medication</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        {/* Name */}
        <Text style={styles.label}>Medication Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter medicine name"
          placeholderTextColor={colors.accent}
          value={name}
          onChangeText={setName}
        />

        {/* Dosage */}
        <Text style={styles.label}>Dosage (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter dosage"
          placeholderTextColor={colors.accent}
          keyboardType="numeric"
          value={dosage}
          onChangeText={setDosage}
        />

        {/* Frequency */}
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.freqRow}>
          {FREQUENCY_OPTIONS.map((opt) => {
            const active = frequency === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.freqChip, active && styles.freqChipActive]}
                onPress={() => setFrequency(opt)}
                activeOpacity={0.9}
              >
                <Text
                  style={[styles.freqChipText, active && styles.freqChipTextActive]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminder */}
        <View style={styles.reminderRow}>
          <Text style={styles.label}>Add Reminder</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <TouchableOpacity hitSlop={10} onPress={() => setReminder(true)}>
              <Feather name="plus" size={18} color={colors.text} />
            </TouchableOpacity>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ true: colors.primary, false: "#D1D5DB" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

      </View>

      {/* Save */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const INPUT_H = ms(48);

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

  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

  label: {
    ...type.body,
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  freqRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  freqChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: ms(6),
    backgroundColor: "#EBDDFF",
  },
  freqChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  freqChipText: {
    ...type.caption,
    color: colors.text,
    fontWeight: "500",
  },
  freqChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  input: {
    height: INPUT_H,
    backgroundColor: "#EBDDFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    ...type.body,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },

  timeRow: {
    height: INPUT_H,
    backgroundColor: "#EBDDFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: { ...type.body, color: colors.text },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  saveBtn: {
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(12),
  },
  saveText: { ...type.body, color: "#fff", fontWeight: "700" },
});
