// src/screens/Tasks.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function Tasks({ navigation }) {
  const [tab, setTab] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;
  const surfaceColor = isDark ? "#1A1A1F" : colors.surface;

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const filter = tab === "today" ? "today" : "week";
      const response = await fetch(`${API_BASE_URL}/api/journals/tasks/?filter=${filter}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        if (response.status === 401) {
          navigation.navigate("Login");
        } else {
          Alert.alert("Error", "Failed to load tasks");
        }
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [tab, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const toggleComplete = async (taskId) => {
    if (completing[taskId]) return;

    try {
      setCompleting((prev) => ({ ...prev, [taskId]: true }));
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/tasks/${taskId}/complete/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      });

      if (response.ok) {
        // Reload tasks to reflect the change
        await loadTasks();
      } else {
        if (response.status === 401) {
          navigation.navigate("Login");
        } else {
          Alert.alert("Error", "Failed to complete task");
        }
      }
    } catch (error) {
      console.error("Error completing task:", error);
      Alert.alert("Error", "Failed to complete task");
    } finally {
      setCompleting((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#EF4444"; // Red
      case "Medium":
        return "#F59E0B"; // Orange/Amber
      case "Low":
        return "#10B981"; // Green
      default:
        return "#10B981";
    }
  };

  const renderItem = ({ item }) => {
    const isCompleting = completing[item.id];
    const priorityColor = getPriorityColor(item.priority);
    
    // Format due date/time
    let dueText = "";
    if (item.due_date_display) {
      dueText = item.due_date_display;
      if (item.due_time_display) {
        dueText += ` ${item.due_time_display}`;
      }
    } else if (item.due_time_display) {
      dueText = item.due_time_display;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggleComplete(item.id)}
        style={[styles.row, { backgroundColor: surfaceColor }]}
        disabled={isCompleting}
      >
        {/* checkbox */}
        <View style={[styles.box, { borderColor: priorityColor }]}>
          {isCompleting ? (
            <ActivityIndicator size="small" color={priorityColor} />
          ) : (
            <Feather name="check" size={14} color={priorityColor} style={{ opacity: 0 }} />
          )}
        </View>

        {/* text */}
        <View style={styles.rowText}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: textColor }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {item.assigned_by_name && (
              <Text style={[styles.assignedBy, { color: textColor, opacity: 0.6 }]}>
                (Assigned by {item.assigned_by_name})
              </Text>
            )}
          </View>
          {dueText && <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>Due {dueText}</Text>}
          {item.details && (
            <Text style={[styles.details, { color: textColor, opacity: 0.6 }]} numberOfLines={1}>
              {item.details}
            </Text>
          )}
        </View>

        {/* priority dot */}
        <View
          style={[
            styles.dot,
            { backgroundColor: priorityColor },
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]}>Tasks</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddTask")}
          hitSlop={10}
          accessibilityLabel="Add task"
        >
          <Feather name="plus" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrap}>
        <Segment
          label="Today"
          active={tab === "today"}
          onPress={() => setTab("today")}
          textColor={textColor}
          bgColor={bgColor}
          surfaceColor={surfaceColor}
        />
        <Segment
          label="This Week"
          active={tab === "week"}
          onPress={() => setTab("week")}
          textColor={textColor}
          bgColor={bgColor}
          surfaceColor={surfaceColor}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor, opacity: 0.6 }]}>
            No tasks {tab === "today" ? "due today" : "this week"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing["3xl"],
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

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
function Segment({ label, active, onPress, textColor, surfaceColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.segment,
        { backgroundColor: surfaceColor, borderColor: colors.border },
        active && styles.segmentActive,
      ]}
    >
      <Text
        style={[
          styles.segmentText,
          { color: active ? "#fff" : textColor },
          active && styles.segmentTextActive,
        ]}
      >
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
  headerTitle: { ...type.h2 },

  segmentWrap: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingVertical: ms(8),
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: '#2D5A27',
    borderColor: '#2D5A27',
  },
  segmentText: { ...type.caption, fontWeight: "700" },
  segmentTextActive: { color: "#fff" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyText: { ...type.body, textAlign: "center" },

  row: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowText: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 2,
  },
  title: { ...type.body, fontWeight: "700", marginRight: spacing.xs },
  assignedBy: { ...type.caption, fontSize: 10 },
  subtitle: { ...type.caption, marginTop: 2 },
  details: { ...type.caption, fontSize: 11, marginTop: 2 },

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
