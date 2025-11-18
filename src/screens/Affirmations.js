import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

export default function Affirmations({ navigation }) {
  const [affirmations, setAffirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;
  const surfaceColor = isDark ? "#1A1A1F" : colors.surface;

  const loadAffirmations = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/affirmations/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAffirmations(data.affirmations || []);
        setCompletedCount(data.completed_count || 0);
        setTotalCount(data.total_count || 0);
      } else {
        if (response.status === 401) {
          navigation.navigate("Login");
        } else {
          Alert.alert("Error", "Failed to load affirmations");
        }
      }
    } catch (error) {
      console.error("Error loading affirmations:", error);
      Alert.alert("Error", "Failed to load affirmations");
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadAffirmations();
    }, [loadAffirmations])
  );

  const toggleCompletion = async (affirmationId, currentlyCompleted) => {
    if (completing[affirmationId]) return;

    try {
      setCompleting((prev) => ({ ...prev, [affirmationId]: true }));
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const newCompleted = !currentlyCompleted;
      const response = await fetch(
        `${API_BASE_URL}/api/journals/affirmations/${affirmationId}/complete/`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: newCompleted }),
        }
      );

      if (response.ok) {
        // Reload affirmations to reflect the change
        await loadAffirmations();
      } else {
        if (response.status === 401) {
          navigation.navigate("Login");
        } else {
          Alert.alert("Error", "Failed to update affirmation");
        }
      }
    } catch (error) {
      console.error("Error updating affirmation:", error);
      Alert.alert("Error", "Failed to update affirmation");
    } finally {
      setCompleting((prev) => ({ ...prev, [affirmationId]: false }));
    }
  };

  const allCompleted = completedCount > 0 && completedCount === totalCount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Daily Affirmations</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <View style={[styles.introContainer, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.introTitle, { color: textColor }]}>Positive Affirmations</Text>
            <Text style={[styles.introText, { color: textColor, opacity: 0.8 }]}>
              Read through these affirmations and check off the ones that resonate with you today.
            </Text>
            {totalCount > 0 && (
              <View style={styles.progressContainer}>
                <Text style={[styles.progressText, { color: textColor, opacity: 0.7 }]}>
                  {completedCount} of {totalCount} completed
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(completedCount / totalCount) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Affirmations List */}
          <View style={styles.affirmationsContainer}>
            {affirmations.map((affirmation) => {
              const isCompleted = affirmation.completed_today;
              const isCompleting = completing[affirmation.id];
              return (
                <TouchableOpacity
                  key={affirmation.id}
                  style={[
                    styles.affirmationCard,
                    { backgroundColor: surfaceColor },
                    isCompleted && [
                      styles.affirmationCardCompleted,
                      { backgroundColor: isDark ? '#1A2E1A' : '#F0F9F0' },
                    ],
                  ]}
                  onPress={() => toggleCompletion(affirmation.id, isCompleted)}
                  activeOpacity={0.8}
                  disabled={isCompleting}
                >
                  <View style={styles.affirmationContent}>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: isDark ? "#666" : colors.border },
                        isCompleted && styles.checkboxCompleted,
                      ]}
                    >
                      {isCompleting ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                      ) : isCompleted ? (
                        <Feather name="check" size={16} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.affirmationText,
                        { color: textColor },
                        isCompleted && styles.affirmationTextCompleted,
                      ]}
                    >
                      {affirmation.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Completion Message */}
          {allCompleted && (
            <View
              style={[
                styles.completionContainer,
                { backgroundColor: isDark ? '#1A2E1A' : '#F0F9F0' },
              ]}
            >
              <Text style={styles.completionTitle}>🎉 Great job!</Text>
              <Text style={[styles.completionText, { color: textColor, opacity: 0.8 }]}>
                You've completed all your daily affirmations. Keep up the positive mindset!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
  headerTitle: { ...type.h2 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  introContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    ...type.h2,
    marginBottom: spacing.sm,
  },
  introText: {
    ...type.body,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressText: {
    ...type.caption,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: '#2D5A27',
    borderRadius: 3,
  },

  affirmationsContainer: {
    paddingHorizontal: spacing.xl,
  },

  affirmationCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  affirmationCardCompleted: {
    borderColor: '#2D5A27',
  },

  affirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: '#2D5A27',
    borderColor: '#2D5A27',
  },

  affirmationText: {
    ...type.body,
    flex: 1,
    lineHeight: 22,
  },
  affirmationTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },

  completionContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#2D5A27',
    alignItems: 'center',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    ...type.h2,
    color: '#2D5A27',
    marginBottom: spacing.sm,
  },
  completionText: {
    ...type.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
