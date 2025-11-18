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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function AddTask({ navigation, route }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [priority, setPriority] = useState("Medium"); // Low | Medium | High
  const [reminder, setReminder] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;
  const surfaceColor = isDark ? "#1A1A1F" : colors.surface;

  const onSave = async () => {
    if (saving) return;
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      // Format date as YYYY-MM-DD
      const dueDate = date.toISOString().split("T")[0];
      
      // Format time as HH:MM:SS
      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const dueTime = `${hours}:${minutes}:00`;

      const taskData = {
        title: title.trim(),
        details: details.trim() || null,
        due_date: dueDate,
        due_time: dueTime,
        priority: priority,
        reminder_enabled: reminder,
      };

      const response = await fetch(`${API_BASE_URL}/api/journals/tasks/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        Alert.alert("Success", "Task created successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          navigation.navigate("Login");
        } else {
          Alert.alert("Error", errorData.detail || "Failed to create task");
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
          <Feather name="x" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Add Task</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        {/* Title */}
        <TextInput
          style={[styles.input, { backgroundColor: surfaceColor, color: textColor }]}
          placeholder="Task Title"
          placeholderTextColor={isDark ? "#666" : colors.accent}
          value={title}
          onChangeText={setTitle}
        />

        {/* Details */}
        <TextInput
          style={[styles.input, styles.textarea, { backgroundColor: surfaceColor, color: textColor }]}
          placeholder="Add details related to your task"
          placeholderTextColor={isDark ? "#666" : colors.accent}
          value={details}
          onChangeText={setDetails}
          multiline
          textAlignVertical="top"
        />

        {/* Date */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.fieldRow, { backgroundColor: surfaceColor }]}
          onPress={() => setShowDate(true)}
        >
          <Text style={[styles.fieldText, { color: textColor }]}>
            {date.toLocaleDateString()}
          </Text>
          <Feather name="calendar" size={18} color={isDark ? "#666" : colors.accent} />
        </TouchableOpacity>

        {/* Time */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.fieldRow, { backgroundColor: surfaceColor }]}
          onPress={() => setShowTime(true)}
        >
          <Text style={[styles.fieldText, { color: textColor }]}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          <Feather name="clock" size={18} color={isDark ? "#666" : colors.accent} />
        </TouchableOpacity>

        {/* Priority */}
        <Text style={[styles.label, { color: textColor }]}>Priority</Text>
        <View style={styles.segmentWrap}>
          {["Low", "Medium", "High"].map((p) => {
            const active = priority === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.segment,
                  { backgroundColor: surfaceColor },
                  active && styles.segmentActive,
                ]}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? "#fff" : textColor },
                    active && styles.segmentTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminder */}
        <View style={styles.reminderRow}>
          <Text style={[styles.label, { color: textColor }]}>Reminder</Text>
          <Switch
            value={reminder}
            onValueChange={setReminder}
            trackColor={{ true: '#2D5A27', false: "#D1D5DB" }}
            thumbColor={reminder ? "#fff" : "#fff"}
          />
        </View>
      </View>

      {/* Save */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          activeOpacity={0.9}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Pickers */}
      {showDate && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "default" : "default"}
            onChange={(e, d) => {
              setShowDate(false);
              if (d) setDate(d);
            }}
          />
        </View>
      )}
      {showTime && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, t) => {
            setShowTime(false);
            if (t) setTime(t);
          }}
        />
      )}
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
  headerTitle: { ...type.h2 },

  body: { paddingHorizontal: spacing.xl },

  input: {
    height: INPUT_H,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...type.body,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  textarea: {
    minHeight: ms(110),
    height: undefined,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },

  fieldRow: {
    height: INPUT_H,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldText: { ...type.body },

  label: { ...type.body, fontWeight: "700", marginBottom: spacing.xs },

  segmentWrap: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: ms(8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: '#2D5A27',
    borderColor: '#2D5A27',
  },
  segmentText: { ...type.caption, fontWeight: "700" },
  segmentTextActive: { color: "#fff" },

  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  saveBtn: {
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(12),
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  saveText: { ...type.body, color: "#fff", fontWeight: "700" },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
});
