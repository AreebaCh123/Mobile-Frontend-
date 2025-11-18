// src/screens/Dashboard.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import { ThemeContext } from "../context/ThemeContext";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";
const { width } = Dimensions.get("window");

// Motivational quotes of the week
const WEEKLY_QUOTES = [
  {
    text: "You are stronger than you think. Every step forward, no matter how small, is progress.",
    author: "Unknown"
  },
  {
    text: "The only way to do great work is to love what you do. Your journey matters.",
    author: "Steve Jobs"
  },
  {
    text: "Healing is not linear. Be patient with yourself. You're doing better than you think.",
    author: "Unknown"
  },
  {
    text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
    author: "Unknown"
  },
  {
    text: "Progress, not perfection. Every day you show up is a victory.",
    author: "Unknown"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "The strongest people are those who win battles we know nothing about.",
    author: "Unknown"
  },
];

export default function Dashboard({ navigation }) {
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState([]);
  const [journalStreak, setJournalStreak] = useState(0);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0, percentage: 0 });
  const [medicationAdherence, setMedicationAdherence] = useState({ onTime: 0, total: 0, days: 0, totalDays: 7 });
  const [exerciseStats, setExerciseStats] = useState({ completed: 0, thisWeek: 0, today: 0 });
  const [milestones, setMilestones] = useState([]);
  const [weeklyQuote, setWeeklyQuote] = useState(WEEKLY_QUOTES[0]);

  // Get quote of the week (changes weekly)
  useEffect(() => {
    const weekNumber = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24 * 7));
    setWeeklyQuote(WEEKLY_QUOTES[weekNumber % WEEKLY_QUOTES.length]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadDashboardData(isActive);
      return () => { isActive = false; };
    }, [])
  );

  const loadDashboardData = async (isActive) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        if (isActive) setLoading(false);
        return;
      }

      // Load mood data for last 7 days
      try {
        const moodRes = await fetch(`${API_BASE_URL}/api/journals/mood-logs/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const moodResData = await moodRes.json();
        if (moodRes.ok && isActive) {
          const logs = moodResData.mood_logs || [];
          // Get last 7 days
          const last7Days = [];
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            last7Days.push({
              date: dateStr,
              value: log ? log.mood_score : null,
              label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
            });
          }
          if (isActive) setMoodData(last7Days);
        }
      } catch (err) {
        console.log('Mood data error:', err);
      }

      // Load milestone data (includes journal streak)
      try {
        const milestoneRes = await fetch(`${API_BASE_URL}/api/journals/milestones/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const milestoneData = await milestoneRes.json();
        if (milestoneRes.ok && isActive) {
          // Extract journal streak
          const journalMilestone = milestoneData.milestones?.journaling || {};
          if (isActive) setJournalStreak(journalMilestone.days || 0);
          
          // Collect milestones (only show if >= 7 days)
          const milestoneList = [];
          if (journalMilestone.days && journalMilestone.days >= 7 && journalMilestone.milestone) {
            milestoneList.push({ type: 'journal', text: `🎉 ${journalMilestone.message || `${journalMilestone.days} days of journaling!`}` });
          }
          const moodMilestone = milestoneData.milestones?.mood || {};
          if (moodMilestone.days && moodMilestone.days >= 7 && moodMilestone.milestone) {
            milestoneList.push({ type: 'mood', text: `📊 ${moodMilestone.message || `${moodMilestone.days} days of mood tracking!`}` });
          }
          const taskMilestone = milestoneData.milestones?.tasks || {};
          if (taskMilestone.days && taskMilestone.days >= 7 && taskMilestone.milestone) {
            milestoneList.push({ type: 'tasks', text: `✅ ${taskMilestone.message || `${taskMilestone.days} days of task completion!`}` });
          }
          if (isActive) setMilestones(milestoneList);
        }
      } catch (err) {
        console.log('Milestone error:', err);
      }

      // Load task statistics (TODAY's tasks only)
      try {
        const today = new Date().toISOString().split('T')[0];
        const tasksRes = await fetch(`${API_BASE_URL}/api/journals/tasks/?filter=today`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasksData = await tasksRes.json();
        if (tasksRes.ok && isActive) {
          const tasks = tasksData.tasks || [];
          // Filter tasks that are due today
          const todayTasks = tasks.filter(t => {
            const taskDate = t.due_date ? t.due_date.split('T')[0] : null;
            return taskDate === today;
          });
          const completed = todayTasks.filter(t => t.completed).length;
          const total = todayTasks.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          // Count total completed tasks for milestone
          const allTasksRes = await fetch(`${API_BASE_URL}/api/journals/tasks/?filter=all`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          const allTasksData = await allTasksRes.json();
          if (allTasksRes.ok) {
            const allCompleted = (allTasksData.tasks || []).filter(t => t.completed).length;
            if (allCompleted >= 10 && isActive) {
              setMilestones(prev => [...prev, { type: 'tasks', text: `🏆 You've completed ${allCompleted} tasks!` }]);
            }
          }
          
          if (isActive) setTaskStats({ completed, total, percentage });
        }
      } catch (err) {
        console.log('Task stats error:', err);
      }

      // Load medication adherence (last 7 days - days with meds taken / 7 days)
      try {
        const medsRes = await fetch(`${API_BASE_URL}/api/journals/medications/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const medsData = await medsRes.json();
        if (medsRes.ok && isActive) {
          const medications = medsData.medications || [];
          const today = new Date();
          const daysWithMeds = new Set();
          
          // Check last 7 days - count days where medication was taken
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            medications.forEach(med => {
              const intakes = med.intakes || [];
              const dayIntakes = intakes.filter(intakeItem => intakeItem.date === dateStr);
              // If any intake was taken on this day, count the day
              if (dayIntakes.some(intake => intake.taken)) {
                daysWithMeds.add(dateStr);
              }
            });
          }
          
          if (isActive) setMedicationAdherence({
            onTime: 0, // Not used for this calculation
            total: 0, // Not used for this calculation
            days: daysWithMeds.size, // Days with meds taken
            totalDays: 7, // Total days checked
          });
        }
      } catch (err) {
        console.log('Medication adherence error:', err);
      }

      // Load exercise statistics (exercises completed per day)
      try {
        const exercisesRes = await fetch(`${API_BASE_URL}/api/journals/exercises/sessions/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const exercisesData = await exercisesRes.json();
        if (exercisesRes.ok && isActive) {
          const sessions = exercisesData.sessions || [];
          const completed = sessions.filter(s => s.completed).length;
          
          // Count exercises completed today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStr = today.toISOString().split('T')[0];
          
          const todayExercises = sessions.filter(s => {
            if (!s.completed) return false;
            const sessionDate = new Date(s.created_at);
            const sessionDateStr = sessionDate.toISOString().split('T')[0];
            return sessionDateStr === todayStr;
          }).length;
          
          // Count this week
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          const thisWeek = sessions.filter(s => {
            if (!s.completed) return false;
            const sessionDate = new Date(s.created_at);
            return sessionDate >= weekAgo;
          }).length;
          
          if (isActive) setExerciseStats({ completed, thisWeek, today: todayExercises });
        }
      } catch (err) {
        console.log('Exercise stats error:', err);
      }

      if (isActive) setLoading(false);
    } catch (error) {
      console.log('Dashboard load error:', error);
      if (isActive) setLoading(false);
    }
  };

  // Prepare chart data
  const chartLabels = moodData.map(d => d.label);
  const chartData = moodData.map(d => d.value || 0);
  const avgMood = chartData.length > 0
    ? (chartData.reduce((a, b) => a + b, 0) / chartData.filter(v => v > 0).length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerRow, { borderBottomColor: isDark ? '#2A2A2F' : colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Progress Dashboard</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Motivational Quote */}
        <View style={[styles.quoteCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
          <View style={styles.quoteHeader}>
            <Feather name="zap" size={24} color={colors.accent} />
            <Text style={[styles.quoteTitle, { color: textColor }]}>Quote of the Week</Text>
          </View>
          <Text style={[styles.quoteText, { color: textColor }]}>{weeklyQuote.text}</Text>
          <Text style={[styles.quoteAuthor, { color: isDark ? '#999' : colors.mutedText }]}>— {weeklyQuote.author}</Text>
        </View>

        {/* Mood Trends */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>📊 Mood Trends (Last 7 Days)</Text>
          <View style={[styles.moodCard, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.avgMoodText, { color: textColor }]}>
              Average Mood: <Text style={{ color: colors.accent, fontWeight: '700' }}>{avgMood}/5</Text>
            </Text>
            {chartData.filter(v => v > 0).length > 0 ? (
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: chartData }],
                }}
                width={width - spacing.xl * 2 - spacing.md * 2}
                height={ms(180)}
                withInnerLines={false}
                withOuterLines={false}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: surfaceColor,
                  backgroundGradientFrom: surfaceColor,
                  backgroundGradientTo: surfaceColor,
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.accent,
                  labelColor: (opacity = 1) => (isDark ? '#999' : colors.mutedText),
                  propsForDots: { r: "4" },
                  strokeWidth: 2,
                }}
                bezier
                style={{ borderRadius: radii.md, marginTop: spacing.md }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: isDark ? '#666' : colors.mutedText }]}>
                  No mood data yet. Start tracking your mood!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Daily Progress Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>📈 Daily Progress</Text>
          
          {/* Journaling Streak */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
            <View style={styles.statLeft}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? '#2D5A27' : '#E8F5E9' }]}>
                <Feather name="book-open" size={24} color={isDark ? '#4CAF50' : '#2D5A27'} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : colors.mutedText }]}>Journaling Streak</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{journalStreak} days 🔥</Text>
              </View>
            </View>
            <Text style={[styles.statEmoji, { color: colors.accent }]}>📝</Text>
          </View>

          {/* Task Completion */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
            <View style={styles.statLeft}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? '#1E3A5F' : '#E3F2FD' }]}>
                <Feather name="check-square" size={24} color={isDark ? '#3B82F6' : '#1E3A5F'} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : colors.mutedText }]}>Task Completion</Text>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {taskStats.percentage}% ({taskStats.completed}/{taskStats.total})
                </Text>
              </View>
            </View>
            <View style={[styles.progressCircle, { borderColor: colors.accent }]}>
              <Text style={[styles.progressText, { color: colors.accent }]}>{taskStats.percentage}%</Text>
            </View>
          </View>

          {/* Medication Adherence */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
            <View style={styles.statLeft}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? '#7C2D12' : '#FEE2E2' }]}>
                <Feather name="pill" size={24} color={isDark ? '#EF4444' : '#7C2D12'} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : colors.mutedText }]}>Medication Adherence</Text>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {medicationAdherence.days}/{medicationAdherence.totalDays || 7} days
                </Text>
                <Text style={[styles.statSubtext, { color: isDark ? '#666' : colors.mutedText }]}>
                  Days with medication taken (last 7 days)
                </Text>
              </View>
            </View>
            <Text style={[styles.statEmoji, { color: colors.accent }]}>💊</Text>
          </View>

          {/* Self-Help Tools */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
            <View style={styles.statLeft}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? '#2A1F3D' : '#E8D5FF' }]}>
                <Feather name="activity" size={24} color={isDark ? '#A855F7' : '#2A1F3D'} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : colors.mutedText }]}>Self-Help Exercises</Text>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {exerciseStats.today} today • {exerciseStats.thisWeek} this week
                </Text>
                <Text style={[styles.statSubtext, { color: isDark ? '#666' : colors.mutedText }]}>
                  {exerciseStats.completed} total completed
                </Text>
              </View>
            </View>
            <Text style={[styles.statEmoji, { color: colors.accent }]}>🧘</Text>
          </View>
        </View>

        {/* Motivational Line */}
        <View style={styles.motivationalLine}>
          <Text style={[styles.motivationalText, { color: colors.accent }]}>
            ✨ Every step forward is progress. Keep going! ✨
          </Text>
        </View>

        {/* Milestones */}
        {milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>🏆 Your Milestones</Text>
            {milestones.map((milestone, index) => (
              <View
                key={index}
                style={[styles.milestoneCard, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}
              >
                <Text style={[styles.milestoneText, { color: textColor }]}>{milestone.text}</Text>
                <Feather name="award" size={20} color={colors.accent} />
              </View>
            ))}
          </View>
        )}

        {/* Encouragement Message */}
        <View style={[styles.encouragementCard, { backgroundColor: isDark ? '#1A3A1A' : '#E8F5E9' }]}>
          <Text style={[styles.encouragementText, { color: isDark ? '#4CAF50' : '#2D5A27' }]}>
            🌟 You're doing amazing! Keep up the great work on your mental health journey.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...type.body,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...type.h2,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  quoteCard: {
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  quoteTitle: {
    ...type.h3,
    fontWeight: '700',
    fontSize: ms(18),
  },
  quoteText: {
    ...type.body,
    fontSize: ms(16),
    lineHeight: ms(24),
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  quoteAuthor: {
    ...type.caption,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...type.h3,
    fontWeight: '700',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  moodCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  avgMoodText: {
    ...type.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...type.body,
    textAlign: 'center',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  statIcon: {
    width: ms(48),
    height: ms(48),
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    ...type.caption,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...type.body,
    fontWeight: '700',
    fontSize: ms(16),
  },
  statSubtext: {
    ...type.caption,
    fontSize: ms(12),
    marginTop: spacing.xs,
  },
  statEmoji: {
    fontSize: ms(28),
  },
  progressCircle: {
    width: ms(50),
    height: ms(50),
    borderRadius: ms(25),
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    ...type.caption,
    fontWeight: '700',
    fontSize: ms(12),
  },
  motivationalLine: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  motivationalText: {
    ...type.body,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: ms(15),
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  milestoneText: {
    ...type.body,
    fontWeight: '600',
    flex: 1,
  },
  encouragementCard: {
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  encouragementText: {
    ...type.body,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: ms(15),
  },
});
