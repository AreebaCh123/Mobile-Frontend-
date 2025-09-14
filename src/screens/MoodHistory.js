import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

const { width } = Dimensions.get("window");
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  return d;
}
function daysInMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return d.getDate();
}
function monthMatrix(date) {
  // returns an array of weeks, each week is 7 numbers (0 = empty, else day)
  const first = startOfMonth(date);
  // convert Sun=0..Sat=6 to Mon=0..Sun=6
  const firstDow = (first.getDay() + 6) % 7;
  const dim = daysInMonth(date);
  const cells = Array(firstDow).fill(0).concat([...Array(dim)].map((_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(0);
  return [...Array(cells.length / 7)].map((_, w) => cells.slice(w * 7, w * 7 + 7));
}

export default function MoodHistory({ navigation }) {
  const [range, setRange] = useState("7d"); // '7d' | '1m'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Fake series for demo
  const series = useMemo(
    () => (range === "7d" ? [3.2, 3.6, 3.4, 3.8, 3.3, 3.9, 3.7] : [3.1, 3.4, 3.2, 3.6, 3.3, 3.8, 3.5, 3.6, 3.4, 3.8, 3.7, 3.5, 3.6, 3.4, 3.7, 3.9, 3.8, 3.6, 3.7, 3.5, 3.4, 3.6, 3.2, 3.4, 3.5, 3.6, 3.4, 3.5, 3.7, 3.6]),
    [range]
  );
  const avg = useMemo(
    () => (series.reduce((a, b) => a + b, 0) / series.length).toFixed(1),
    [series]
  );

  const matrix = useMemo(() => monthMatrix(currentMonth), [currentMonth]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing["3xl"] }}>
        {/* Top bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <Chip active={range === "7d"} onPress={() => setRange("7d")}>Last 7 Days</Chip>
          <Chip active={range === "1m"} onPress={() => setRange("1m")}>Last Month</Chip>
        </View>

        {/* Mood Trends */}
        <Text style={styles.sectionLead}>Mood Trends</Text>
        <Text style={styles.avgText}>
          Average Mood: <Text style={{ fontWeight: "800" }}>{avg}</Text>
        </Text>
        <Text style={styles.deltaText}>Last 7 Days <Text style={{ color: "#10B981" }}>+10%</Text></Text>

        <View style={styles.chartWrap}>
          <LineChart
            data={{
              labels: WEEKDAYS,
              datasets: [{ data: series }],
            }}
            width={width - spacing.xl * 2}
            height={ms(180)}
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

        {/* Weekday labels (under the chart) */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={styles.weekText}>{d}</Text>
          ))}
        </View>

        {/* Calendar */}
        <Text style={styles.calendarLead}>Journal History</Text>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            <Feather name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleString("default", { month: "long" })}{" "}
            {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <Feather name="chevron-right" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <Text key={d} style={styles.weekHeadText}>{d}</Text>
          ))}
        </View>

        {matrix.map((week, i) => (
          <View key={i} style={styles.weekRowCalendar}>
            {week.map((day, j) => {
              const isSelected = day !== 0 && selectedDay === day;
              return (
                <TouchableOpacity
                  key={j}
                  style={[
                    styles.dayCell,
                    isSelected && styles.daySelected,
                  ]}
                  disabled={day === 0}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && { color: colors.text, fontWeight: "700" }]}>
                    {day === 0 ? "" : day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
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
    ...type.h1,
    paddingHorizontal: spacing.xl,
    color: colors.text,
  },
  deltaText: {
    ...type.caption,
    paddingHorizontal: spacing.xl,
    color: colors.mutedText,
    marginBottom: spacing.sm,
  },

  chartWrap: { alignItems: "center" },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl + 4,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  weekText: { ...type.caption, color: colors.mutedText },

  calendarLead: {
    ...type.h2,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  monthTitle: { ...type.body, color: colors.text, fontWeight: "700" },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl + 4,
    marginBottom: spacing.xs,
  },
  weekHeadText: { ...type.caption, color: colors.mutedText },

  weekRowCalendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  daySelected: {
    backgroundColor: "#EBDDFF",
  },
  dayText: { ...type.caption, color: colors.text },
});
