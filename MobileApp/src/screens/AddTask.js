import React, { useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function AddTask({ navigation, route }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [priority, setPriority] = useState("Medium"); // Low | Medium | High
  const [reminder, setReminder] = useState(false);

  const onSave = () => {
    const task = {
      id: Date.now().toString(),
      title: title.trim() || "Untitled",
      details: details.trim(),
      dueDate: date,
      dueTime: time,
      priority,
      reminder,
    };

    // Send back to previous screen if you want to append to a list there:
    // navigation.navigate('Tasks', { newTask: task })
    // For now: just go back.
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Task</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Task Title"
          placeholderTextColor={colors.accent}
          value={title}
          onChangeText={setTitle}
        />

        {/* Details */}
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Add details related to your task"
          placeholderTextColor={colors.accent}
          value={details}
          onChangeText={setDetails}
          multiline
          textAlignVertical="top"
        />

        {/* Date */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fieldRow}
          onPress={() => setShowDate(true)}
        >
          <Text style={styles.fieldText}>
            {date.toLocaleDateString()}
          </Text>
          <Feather name="calendar" size={18} color={colors.accent} />
        </TouchableOpacity>

        {/* Time */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fieldRow}
          onPress={() => setShowTime(true)}
        >
          <Text style={styles.fieldText}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          <Feather name="clock" size={18} color={colors.accent} />
        </TouchableOpacity>

        {/* Priority */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.segmentWrap}>
          {["Low", "Medium", "High"].map((p) => {
            const active = priority === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[styles.segment, active && styles.segmentActive]}
                activeOpacity={0.9}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminder */}
        <View style={styles.reminderRow}>
          <Text style={styles.label}>Reminder</Text>
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
        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>Save</Text>
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
  headerTitle: { ...type.h2, color: colors.text },

  body: { paddingHorizontal: spacing.xl },

  input: {
    height: INPUT_H,
    backgroundColor: "#EBDDFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
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
    backgroundColor: "#EBDDFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldText: { ...type.body, color: colors.text },

  label: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.xs },

  segmentWrap: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    backgroundColor: "#EFE6FA",
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
  segmentText: { ...type.caption, color: colors.accent, fontWeight: "700" },
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
