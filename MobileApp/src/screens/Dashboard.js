// src/screens/Dashboard.js
import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

const { width } = Dimensions.get("window");

/* ---------- helpers ---------- */
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const parse = (s) => {
  // expect YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** make mock mood data for last 60 days: [{date:'YYYY-MM-DD', value: 1..5}] */
function makeMockData(days = 60) {
  const today = new Date();
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = addDays(today, -i);
    // little wavy signal + noise in 1..5 range
    const base = 3 + Math.sin((i / 6) * Math.PI) * 0.6;
    const noise = (Math.random() - 0.5) * 0.6;
    const v = Math.min(5, Math.max(1, Number((base + noise).toFixed(1))));
    arr.push({ date: fmt(dt), value: v });
  }
  return arr;
}

export default function Dashboard({ navigation }) {
  const allData = useMemo(() => makeMockData(60), []);
  // default to last 7 days
  const defaultStart = useMemo(() => fmt(addDays(new Date(), -6)), []);
  const defaultEnd = useMemo(() => fmt(new Date()), []);

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [filtered, setFiltered] = useState(allData.slice(-7));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // apply range the first time
  useEffect(() => {
    applyRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyRange = () => {
    const s = parse(start);
    const e = parse(end);
    if (!s || !e) {
      Alert.alert("Invalid dates", "Use the format YYYY-MM-DD.");
      return;
    }
    if (s > e) {
      Alert.alert("Invalid range", "Start date must be before end date.");
      return;
    }
    const subset = allData.filter((d) => {
      const t = parse(d.date);
      return t >= s && t <= e;
    });
    if (subset.length === 0) {
      Alert.alert("No data", "No data points in this range.");
      return;
    }
    setFiltered(subset);
  };

  // chart data
  const labels = useMemo(() => {
    // If short range (<= 10 days), show weekday initial; else show day number spaced out
    if (filtered.length <= 10) {
      return filtered.map((d) =>
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parse(d.date).getDay()]
      );
    }
    // every ~Nth label to avoid clutter
    const step = Math.ceil(filtered.length / 7);
    return filtered.map((d, i) => (i % step === 0 ? parse(d.date).getDate().toString() : ""));
  }, [filtered]);

  const series = useMemo(() => filtered.map((d) => d.value), [filtered]);
  const avg = useMemo(
    () => (series.reduce((a, b) => a + b, 0) / series.length).toFixed(1),
    [series]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing["3xl"] }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Date Range inputs */}
        <Text style={styles.rangeLabel}>Date Range (Tap to select dates)</Text>
        <View style={styles.rangeRow}>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={16} color='#2D5A27' />
            <Text style={styles.dateText}>{start}</Text>
          </TouchableOpacity>
          <Text style={styles.toText}>to</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={16} color='#2D5A27' />
            <Text style={styles.dateText}>{end}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={applyRange}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Mood Trends */}
        <Text style={styles.sectionLead}>Mood Trends</Text>
        <Text style={styles.avgText}>
          Average Mood: <Text style={{ fontWeight: "800" }}>{avg}</Text>
        </Text>
        <Text style={styles.deltaText}>
          {start} → {end} <Text style={{ color: "#10B981" }}>+10%</Text>
        </Text>

        <View style={styles.chartWrap}>
          <LineChart
            data={{
              labels,
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
              color: (opacity = 1) => colors.accent,
              labelColor: (opacity = 1) => "#9A8FA7",
              propsForDots: { r: "3" },
            }}
            bezier
            style={{ borderRadius: radii.lg }}
          />
        </View>

        {/* Stats row (sample static tiles, keep as-is) */}
        <View style={styles.statsWrap}>
          <View style={styles.statRow}>
            <View>
              <Text style={styles.statTitle}>Journaling Streak</Text>
              <Text style={styles.statSub}>5 days</Text>
            </View>
            <Image source={require("../../assets/journal.png")} style={styles.statImg} />
          </View>

          <View style={styles.statRow}>
            <View>
              <Text style={styles.statTitle}>Task Completion</Text>
              <Text style={styles.statSub}>75%</Text>
            </View>
            <Image source={require("../../assets/task.png")} style={styles.statImg} />
          </View>

          <View style={styles.statRow}>
            <View>
              <Text style={styles.statTitle}>Medication Adherence</Text>
              <Text style={styles.statSub}>On time 6/7 days</Text>
            </View>
            <Image source={require("../../assets/meds.png")} style={styles.statImg} />
          </View>
        </View>

        {/* Milestones (keep your own dynamic content if you fetch daily) */}
        <Text style={styles.sectionHeader}>Milestones</Text>

        <View style={styles.card}>
          <Image source={require("../../assets/milestone.png")} style={styles.cardImg} />
          <Text style={styles.cardText}>You’ve completed 100 tasks.</Text>
        </View>

        <View style={styles.card}>
          <Image source={require("../../assets/quote.png")} style={styles.cardImg} />
          <Text style={styles.cardText}>
            Quote of the week{"\n"}
            <Text style={{ fontWeight: "400" }}>
              The only way to do great work is to love what you do.
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={parse(start) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "default" : "default"}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (event.type === 'set' && selectedDate) {
              setStart(fmt(selectedDate));
            }
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={parse(end) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "default" : "default"}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (event.type === 'set' && selectedDate) {
              setEnd(fmt(selectedDate));
            }
          }}
        />
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
  headerTitle: { ...type.h2, color: colors.text },

  rangeLabel: {
    ...type.caption,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dateInput: {
    flexGrow: 1,
    minWidth: 120,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#2D5A27',
    paddingHorizontal: spacing.md,
    paddingVertical: ms(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    ...type.body,
    color: colors.text,
  },
  toText: { ...type.body, color: colors.mutedText },
  applyBtn: {
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    paddingVertical: ms(10),
    paddingHorizontal: ms(14),
    alignSelf: 'center',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  applyText: { ...type.body, color: "#fff", fontWeight: "700" },

  sectionLead: {
    ...type.caption,
    color: colors.mutedText,
    paddingHorizontal: spacing.xl,
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

  chartWrap: { alignItems: "center", marginBottom: spacing.lg },

  statsWrap: { marginBottom: spacing.lg },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statTitle: { ...type.body, color: colors.text, fontWeight: "700" },
  statSub: { ...type.caption, color: colors.mutedText },
  statImg: { width: 60, height: 40, borderRadius: radii.md },

  sectionHeader: {
    ...type.h2,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  card: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: 120, marginBottom: spacing.sm },
  cardText: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    color: "#fff",
    fontWeight: "700",
    ...type.body,
  },
});
