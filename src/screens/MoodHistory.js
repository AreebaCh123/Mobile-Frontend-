import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function MoodHistory({ navigation }) {
  const [range, setRange] = useState("7d"); // only last 7 days now
  const [authToken, setAuthToken] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const [monthCursor, setMonthCursor] = useState(new Date());
  const [monthAnalytics, setMonthAnalytics] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;

  useEffect(() => {
    AsyncStorage.getItem("authToken").then(setAuthToken).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!authToken) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/journals/moods/?range=${range}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.log("Mood history error:", data);
          setPoints([]);
          return;
        }
        setPoints(data.points || []);
      } catch (error) {
        console.log("Mood history network error:", error);
        setPoints([]);
      } finally {
        setLoading(false);
        setLoadedOnce(true);
      }
    };
    load();
  }, [authToken, range]);

  useEffect(() => {
    const loadMonth = async () => {
      if (!authToken) return;
      setLoadingMonth(true);
      try {
        const year = monthCursor.getFullYear();
        const month = monthCursor.getMonth() + 1;
        const response = await fetch(
          `${API_BASE_URL}/api/journals/moods/analytics/?year=${year}&month=${month}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.log("Mood month analytics error:", data);
          setMonthAnalytics(null);
          return;
        }
        setMonthAnalytics(data);
      } catch (error) {
        console.log("Mood month analytics network error:", error);
        setMonthAnalytics(null);
      } finally {
        setLoadingMonth(false);
      }
    };
    loadMonth();
  }, [authToken, monthCursor]);

  const series = points.map((p) => p.average_score || 0);
  const labels = points.map((p) =>
    new Date(p.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" })
  );

  const avg = useMemo(() => {
    if (!series.length) return "–";
    return (series.reduce((a, b) => a + b, 0) / series.length).toFixed(1);
  }, [series]);

  const monthLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
    return formatter.format(monthCursor);
  }, [monthCursor]);

  const handlePrevMonth = () => {
    setMonthCursor((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setMonthCursor((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const calendarByDay = useMemo(() => {
    const map = {};
    if (monthAnalytics?.calendar) {
      monthAnalytics.calendar.forEach((item) => {
        map[item.day] = item;
      });
    }
    return map;
  }, [monthAnalytics]);

  const buildMonthDays = () => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  };

  const moodColorForScore = (score) => {
    if (score == null) return "transparent";
  
    if (score >= 7) return "#9B5DE5";   // Purple (High mood)
    if (score >= 4) return "#F15BB5";   // Pink (Medium mood)
    
    return "#FFFFFF";                   // White (Low mood)
  };
  

  const pieData = useMemo(() => {
    if (!monthAnalytics?.emotion_breakdown?.length) return [];
    const total = monthAnalytics.emotion_breakdown.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const palette = [
      colors.accent,
      colors.primary,
      "#B39DDB",
      "#80CBC4",
      "#FFCC80",
      "#90CAF9",
    ];
    return monthAnalytics.emotion_breakdown.map((item, index) => ({
      name: item.mood_label || "Unknown",
      population: item.count,
      color: palette[index % palette.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
      percentage: total ? ((item.count / total) * 100).toFixed(0) : "0",
    }));
  }, [monthAnalytics]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing["3xl"] }}>
        {/* Top bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Mood History</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Intro copy */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>See your mood journey</Text>
          <Text style={styles.introBody}>
            This page gives you a gentle overview of how your mood has been lately. Look for patterns,
            celebrate your better days, and treat yourself with kindness on the harder ones.
          </Text>
          <Text style={styles.introQuote}>
            “Every feeling is valid — what matters is how gently you respond to it.”
          </Text>
        </View>

        {/* Filter (only Last 7 Days) */}
        <View style={styles.filterRow}>
          <Chip active={true} onPress={() => {}}>Last 7 Days</Chip>
        </View>

        {/* Mood Timeline (Daily Mood Chart) */}
        <Text style={styles.sectionLead}>Mood timeline</Text>
        <Text style={styles.avgText}>
          Average mood:{" "}
          <Text style={{ fontWeight: "800" }}>{avg}</Text>
        </Text>

        {loading && !loadedOnce ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>Loading mood history…</Text>
          </View>
        ) : series.length === 0 ? (
          <Text style={styles.emptyText}>
            No mood entries yet for this period. Save a few moods to see your trend here.
          </Text>
        ) : (
          <>
            <View style={styles.chartWrap}>
              <LineChart
                data={{
                  labels: labels,
                  datasets: [{ data: series }],
                }}
                width={width - spacing.xl * 2}
                height={ms(200)}
                withInnerLines={false}
                withOuterLines={false}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: colors.bg,
                  backgroundGradientFrom: colors.bg,
                  backgroundGradientTo: colors.bg,
                  decimalPlaces: 1,
                  color: () => colors.accent,
                  labelColor: () => "#9A8FA7",
                  propsForDots: { r: "3" },
                }}
                bezier
                style={{ borderRadius: radii.lg }}
              />
            </View>
          </>
        )}

        {/* Monthly Overview */}
        <Text style={styles.sectionLead}>Monthly overview</Text>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth} hitSlop={10}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={handleNextMonth} hitSlop={10}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {loadingMonth ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>Loading monthly insights…</Text>
          </View>
        ) : !monthAnalytics || monthAnalytics.stats.total_entries === 0 ? (
          <Text style={styles.emptyText}>
            No moods saved for this month yet. Track a few days to see your calendar and stats here.
          </Text>
        ) : (
          <>
            {/* Stats cards */}
            <View style={styles.statsRow}>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Average mood</Text>
                <Text style={styles.statsValue}>
                  {monthAnalytics.stats.average_score ?? "–"}
                </Text>
              </View>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Total entries</Text>
                <Text style={styles.statsValue}>
                  {monthAnalytics.stats.total_entries}
                </Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Best day</Text>
                <Text style={styles.statsValue}>
                  {monthAnalytics.stats.best_day
                    ? `${monthAnalytics.stats.best_day.day}`
                    : "–"}
                </Text>
              </View>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Tough day</Text>
                <Text style={styles.statsValue}>
                  {monthAnalytics.stats.worst_day
                    ? `${monthAnalytics.stats.worst_day.day}`
                    : "–"}
                </Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statsCard, { flex: 1 }]}>
                <Text style={styles.statsLabel}>Most frequent mood</Text>
                <Text style={styles.statsValue}>
                  {monthAnalytics.stats.most_frequent_mood || "–"}
                </Text>
              </View>
            </View>

            {/* Mood Calendar View */}
            <View style={styles.calendarCard}>
              <View style={styles.weekHeader}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
                  <Text key={`weekday-${index}`} style={styles.weekHeadText}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {buildMonthDays().map((day, index) => {
                  const data = day ? calendarByDay[day] : null;
                  const score = data?.average_score ?? null;
                  const bgColor = day ? moodColorForScore(score) : "transparent";
                  const hasEntry = !!data;
                  return (
                    <View
                      key={`${day || "empty"}-${index}`}
                      style={[styles.dayCell, hasEntry && { backgroundColor: bgColor }]}
                    >
                      {day ? (
                        <Text
                          style={[
                            styles.dayText,
                            hasEntry && score >= 7 && { color: "#fff" },
                          ]}
                        >
                          {day}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#9B5DE5" }]} />
                  <Text style={styles.legendText}>Higher mood</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor:  "#F15BB5" }]} />
                  <Text style={styles.legendText}>Medium mood</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ccc" }]} />
                  <Text style={styles.legendText}>Lower mood</Text>
                </View>
              </View>
            </View>

            {/* Emotion Breakdown Pie Chart */}
            <Text style={styles.sectionLead}>Emotion breakdown</Text>
            {pieData.length === 0 ? (
              <Text style={styles.emptyText}>
                Once you log moods with labels, you’ll see an emotion breakdown here.
              </Text>
            ) : (
              <View style={styles.pieWrapper}>
                <PieChart
                  data={pieData}
                  width={width - spacing.xl * 2}
                  height={ms(220)}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  hasLegend={false}
                  chartConfig={{
                    backgroundColor: colors.bg,
                    backgroundGradientFrom: colors.bg,
                    backgroundGradientTo: colors.bg,
                    color: () => colors.accent,
                    labelColor: () => colors.text,
                  }}
                />
                <View style={styles.pieLegend}>
                  {pieData.map((item, index) => (
                    <View key={`pie-${item.name}-${index}`} style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: item.color }]}
                      />
                      <Text style={styles.legendText}>
                        {item.name} ({item.percentage}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ active, onPress, children }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
    </TouchableOpacity>
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
  headerTitle: { ...type.h2, color: colors.text },

  introCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introTitle: {
    ...type.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "left",
    fontWeight: "700",
  },
  introBody: {
    ...type.body,
    color: colors.mutedText,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  introQuote: {
    ...type.caption,
    color: colors.accent,
    fontStyle: "italic",
  },

  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: "#E6D9F6",
    paddingVertical: ms(8),
    paddingHorizontal: ms(12),
    borderRadius: radii.pill,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  sectionLead: {
    ...type.caption,
    color: colors.mutedText,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  avgText: {
    ...type.h2,
    paddingHorizontal: spacing.xl,
    color: colors.text,
  },
  chartWrap: { alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.lg },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...type.caption,
    color: colors.mutedText,
  },
  emptyText: {
    ...type.body,
    color: colors.mutedText,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    textAlign: "center",
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  monthLabel: {
    ...type.body,
    color: colors.text,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  statsCard: {
    flex: 1,
    marginRight: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsLabel: {
    ...type.caption,
    color: colors.mutedText,
    marginBottom: spacing.xs,
  },
  statsValue: {
    ...type.h3,
    color: colors.text,
  },

  calendarCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  weekHeadText: {
    ...type.caption,
    color: colors.mutedText,
    textAlign: "center",
    flex: 1,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  dayCell: {
    width: (width - spacing.xl * 2 - spacing.md * 2) / 7 - 2,
    aspectRatio: 1,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayText: {
    ...type.caption,
    color: colors.text,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...type.caption,
    color: colors.text,
  },

  pieWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing["2xl"],
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    alignSelf: "flex-end",
    marginRight: spacing.xl,
    width: width - spacing.xl * 2,
  },
  pieLegend: {
    marginTop: spacing.md,
    width: "100%",
    gap: spacing.xs,
  },
});
