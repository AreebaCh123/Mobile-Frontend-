// src/screens/Home.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';

const { width } = Dimensions.get('window');

const QUOTES = [
  'You are stronger than you think!',
  'Small steps every day.',
  'Breathe. You’ve got this.',
  'Progress, not perfection.',
  'Be kind to your mind.',
];

const IMAGES = {
  s1: require('../../assets/s1.png'), // journal
  s2: require('../../assets/s2.png'), // mood
  s3: require('../../assets/s3.png'), // milestone
  s4: require('../../assets/s4.png'), // emergency icon (red FAB)
};

export default function Home({ navigation }) {
  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 18 ? 'Good Morning' : 'Good Night';
  const userName = 'Areeba'; // placeholder for now

  // Pick a random quote when screen mounts
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );

  // simple mock trend data
  const [trend] = useState([60, 70, 65, 72, 68, 75, 78]);

  return (
    <View style={styles.container}>
      {/* Top header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={10}>
          <Feather name="settings" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['3xl'] + ms(70) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Professional Header */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingText}>
            {greeting}, {userName}
          </Text>
          <Text style={styles.subtitle}>Welcome to your wellness dashboard</Text>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteIcon}>💭</Text>
            <Text style={styles.quote}>"{quote}"</Text>
          </View>
        </View>

        {/* Journal Reminder card */}
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardLabel}>Journal Reminder</Text>
            <Text style={styles.cardTitle}>Reflect on your day</Text>
            <Text style={styles.cardSub}>
              Take a moment to write down your thoughts and feelings.
            </Text>
            <TouchableOpacity
              style={styles.pill}
              onPress={() => navigation.navigate('Journal')}
            >
              <Text style={styles.pillText}>Write Now</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.cardRight, { backgroundColor: '#F6D7D0' }]}
            onPress={() => navigation.navigate('Journal')}
            activeOpacity={0.9}
          >
            <Image source={IMAGES.s1} style={styles.cardImg} />
          </TouchableOpacity>
        </View>

        {/* Today's Mood card */}
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardLabel}>Today's Mood</Text>
            <Text style={styles.cardTitle}>Feeling good</Text>
            <Text style={styles.cardSub}>Happy</Text>
            <TouchableOpacity
              style={styles.pill}
              onPress={() => navigation.navigate('MoodTracker')}
            >
              <Text style={styles.pillText}>Update</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.cardRight, { backgroundColor: '#EFE7FB' }]}
            onPress={() => navigation.navigate('MoodTracker')}
            activeOpacity={0.9}
          >
            <Image source={IMAGES.s2} style={styles.cardImg} />
          </TouchableOpacity>
        </View>

        {/* Tasks list */}
        <Text style={styles.sectionTitle}>Today’s Tasks</Text>

        <TouchableOpacity
          style={styles.taskRow}
          onPress={() => navigation.navigate('Medications')}
          activeOpacity={0.8}
        >
          <View style={[styles.taskIcon, { backgroundColor: '#CBA4F4' }]}>
            <Text style={styles.taskIconText}>💊</Text>
          </View>
          <View style={styles.taskTextWrap}>
            <Text style={styles.taskTitle}>Medicine Reminder</Text>
            <Text style={styles.taskSub}>Take your medication</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskRow}
          onPress={() => navigation.navigate('Affirmations')}
          activeOpacity={0.8}
        >
          <View style={[styles.taskIcon, { backgroundColor: '#CBA4F4' }]}>
            <Text style={styles.taskIconText}>☑️</Text>
          </View>
          <View style={styles.taskTextWrap}>
            <Text style={styles.taskTitle}>Affirmations</Text>
            <Text style={styles.taskSub}>Complete your daily affirmations</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Weekly Mood Trend */}
        <Text style={[styles.sectionTitle, { marginTop: spacing['2xl'] }]}>
          Weekly Mood Trend
        </Text>
        <Text style={styles.bigNumber}>75%</Text>
        <Text style={styles.smallMeta}>
          Last 7 Days <Text style={{ color: '#10B981' }}>+10%</Text>
        </Text>

        <View style={styles.chartWrap}>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{ data: trend }],
            }}
            width={width - spacing.xl * 2}
            height={ms(180)}
            yAxisLabel=""
            yAxisSuffix="%"
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundColor: colors.bg,
              backgroundGradientFrom: colors.bg,
              backgroundGradientTo: colors.bg,
              decimalPlaces: 0,
              color: () => colors.accent,
              labelColor: () => '#9A8FA7',
              propsForDots: { r: '3' },
            }}
            bezier
            style={{ borderRadius: radii.lg }}
          />
        </View>

        {/* Milestone Highlight */}
        <View style={styles.milestoneRow}>
          <View style={styles.milestoneLeft}>
            <Text style={styles.milestoneTitle}>Milestone Highlight</Text>
            <Text style={styles.milestoneSub}>
              You’ve completed 30 days of journaling!
            </Text>
            <TouchableOpacity
  style={styles.pillSecondary}
  onPress={() => navigation.navigate('Dashboard')}
>
  <Text style={styles.pillSecondaryText}>Dashboard</Text>
</TouchableOpacity>

          </View>
          <View style={[styles.cardRight, { backgroundColor: '#F6D7D0' }]}>
            <Image source={IMAGES.s3} style={styles.cardImg} />
          </View>
        </View>
      </ScrollView>

      {/* Emergency Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CrisisSupport')}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Image source={IMAGES.s4} style={styles.fabIcon} resizeMode="contain" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },

  greetingWrap: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greetingText: { 
    ...type.h1, 
    color: colors.text, 
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subtitle: {
    ...type.body,
    color: colors.mutedText,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  quoteIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  quote: { 
    ...type.caption, 
    color: colors.text,
    flex: 1,
    fontStyle: 'italic',
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
    gap: spacing.lg,
  },
  cardLeft: { flex: 1 },
  cardLabel: { ...type.caption, color: colors.mutedText, marginBottom: spacing.xs },
  cardTitle: { ...type.h2, color: colors.text, marginBottom: spacing.xs },
  cardSub: { ...type.caption, color: colors.mutedText, marginBottom: spacing.md },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillText: { color: '#fff', fontWeight: '700' },

  cardRight: {
    width: ms(120),
    height: ms(120),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImg: { width: '85%', height: '85%', borderRadius: radii.md },

  sectionTitle: {
    ...type.h2,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  taskIconText: { fontSize: 18 },
  taskTextWrap: { flex: 1 },
  taskTitle: { ...type.body, color: colors.text, fontWeight: '700' },
  taskSub: { ...type.caption, color: colors.mutedText },
  chevron: { fontSize: 22, color: '#7C7C7C', marginLeft: spacing.md },

  bigNumber: {
    ...type.h1,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  smallMeta: {
    ...type.caption,
    paddingHorizontal: spacing.xl,
    color: colors.mutedText,
    marginBottom: spacing.md,
  },
  chartWrap: { alignItems: 'center', marginBottom: spacing['2xl'] },

  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    marginTop: spacing['2xl'],
  },
  milestoneLeft: { flex: 1 },
  milestoneTitle: { ...type.h2, color: colors.text, marginBottom: spacing.xs },
  milestoneSub: { ...type.caption, color: colors.mutedText, marginBottom: spacing.md },
  pillSecondary: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6D9F6',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillSecondaryText: { color: colors.accent, fontWeight: '700' },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing['3xl'] + ms(8),
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabInner: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { width: ms(22), height: ms(22) },
});
