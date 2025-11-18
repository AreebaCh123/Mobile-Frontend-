// src/screens/Home.js
import React, { useEffect, useMemo, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { scheduleAllNotifications } from '../services/notificationService';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

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

export default function Home({ navigation, route }) {
  const [user, setUser] = useState(route?.params?.user ?? null);
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [loadingHome, setLoadingHome] = useState(false);
  const [hasPendingMeds, setHasPendingMeds] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [hasDueTasks, setHasDueTasks] = useState(false);
  const [gratitudeData, setGratitudeData] = useState(null);
  const [dailyTip, setDailyTip] = useState(null);
  const [hasTherapist, setHasTherapist] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  useEffect(() => {
    if (route?.params?.user) {
      setUser(route.params.user);
      AsyncStorage.setItem('userProfile', JSON.stringify(route.params.user)).catch(console.log);
    }
  }, [route?.params?.user]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadHomeData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('userProfile');
          if (storedUser && isActive) {
            setUser(JSON.parse(storedUser));
          }

          const token = await AsyncStorage.getItem('authToken');
          if (!token) {
            return;
          }

          setLoadingHome(true);
          const response = await fetch(`${API_BASE_URL}/api/users/home/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok && isActive) {
            setGreeting(data?.greeting ?? '');
            setQuote(data?.quote ?? '');
          } else {
            console.log('Home endpoint error', data);
          }

          // Load medication summary for today
          let medData = null;
          try {
            const medRes = await fetch(`${API_BASE_URL}/api/journals/medications/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            medData = await medRes.json();
            if (medRes.ok && isActive) {
              setHasPendingMeds(Boolean(medData?.has_pending));
            } else {
              setHasPendingMeds(false);
            }
          } catch (medErr) {
            console.log('Home meds fetch error', medErr);
            if (isActive) setHasPendingMeds(false);
          }

          // Load milestone data
          try {
            const milestoneRes = await fetch(`${API_BASE_URL}/api/journals/milestones/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const milestoneResData = await milestoneRes.json();
            if (milestoneRes.ok && isActive) {
              setMilestoneData(milestoneResData);
            }
          } catch (milestoneErr) {
            console.log('Home milestones fetch error', milestoneErr);
          }

          // Load tasks due today
          let tasksData = null;
          try {
            const tasksRes = await fetch(`${API_BASE_URL}/api/journals/tasks/?filter=today`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            tasksData = await tasksRes.json();
            if (tasksRes.ok && isActive) {
              const tasks = tasksData.tasks || [];
              setHasDueTasks(tasks.length > 0);
            } else {
              setHasDueTasks(false);
            }
          } catch (tasksErr) {
            console.log('Home tasks fetch error', tasksErr);
            if (isActive) setHasDueTasks(false);
          }

          // Load gratitude entry for today
          try {
            const gratitudeRes = await fetch(`${API_BASE_URL}/api/journals/gratitude/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const gratitudeData = await gratitudeRes.json();
            if (gratitudeRes.ok && isActive) {
              setGratitudeData(gratitudeData);
            }
          } catch (gratitudeErr) {
            console.log('Home gratitude fetch error', gratitudeErr);
          }

          // Schedule notifications
          try {
            // Get notification preferences
            const prefRes = await fetch(`${API_BASE_URL}/api/notifications/preferences/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const preferences = prefRes.ok ? await prefRes.json() : {
              task_reminders: true,
              medication_reminders: true,
              journal_reminders: true,
              mood_reminders: true,
            };

            // Get tasks for today
            const tasksForNotif = tasksData?.tasks || [];
            const todayTasks = tasksForNotif.filter(t => {
              const taskDate = t.due_date ? t.due_date.split('T')[0] : null;
              const today = new Date().toISOString().split('T')[0];
              return taskDate === today && !t.completed;
            });

            // Get medications
            const medicationsForNotif = medData?.medications || [];

            // Check if journal written today
            const journalRes = await fetch(`${API_BASE_URL}/api/journals/entries/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const journalData = journalRes.ok ? await journalRes.json() : { entries: [] };
            const today = new Date().toISOString().split('T')[0];
            const hasJournalToday = (journalData.entries || []).some(entry => 
              entry.created_at?.split('T')[0] === today
            );

            // Check if mood logged today
            const moodRes = await fetch(`${API_BASE_URL}/api/journals/mood-logs/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const moodData = moodRes.ok ? await moodRes.json() : { mood_logs: [] };
            const hasMoodToday = (moodData.mood_logs || []).some(log => 
              log.date === today
            );

            // Get milestone data for notifications
            const milestoneRes = await fetch(`${API_BASE_URL}/api/journals/milestones/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const milestoneData = milestoneRes.ok ? await milestoneRes.json() : null;

            // Schedule all notifications
            if (isActive) {
              scheduleAllNotifications(
                todayTasks,
                medicationsForNotif,
                hasJournalToday,
                hasMoodToday,
                preferences,
                milestoneData?.milestones || null
              );
            }
          } catch (notifErr) {
            console.log('Home notification scheduling error', notifErr);
          }

          // Load daily tip
          try {
            const tipRes = await fetch(`${API_BASE_URL}/api/journals/daily-tip/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            const tipData = await tipRes.json();
            if (tipRes.ok && isActive) {
              setDailyTip(tipData.tip);
            }
          } catch (tipErr) {
            console.log('Home daily tip fetch error', tipErr);
          }

          // Check if user has a therapist from profile
          try {
            const profileRes = await fetch(`${API_BASE_URL}/api/users/profile/me/`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (isActive) {
                const hasTherapistValue = profileData.therapist !== null && profileData.therapist !== undefined;
                console.log('Home: Therapist check from profile:', hasTherapistValue, profileData.therapist);
                setHasTherapist(hasTherapistValue);
              }
            } else {
              // Fallback: try chat endpoint if profile doesn't exist
              const chatRes = await fetch(`${API_BASE_URL}/api/journals/chat/messages/`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
              });
              const chatData = await chatRes.json();
              if (chatRes.ok && isActive) {
                console.log('Home: Therapist check from chat:', chatData.has_therapist);
                setHasTherapist(chatData.has_therapist || false);
              }
            }
          } catch (profileErr) {
            console.log('Home therapist check error', profileErr);
            // Fallback: try chat endpoint
            try {
              const chatRes = await fetch(`${API_BASE_URL}/api/journals/chat/messages/`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
              });
              const chatData = await chatRes.json();
              if (chatRes.ok && isActive) {
                console.log('Home: Therapist check fallback from chat:', chatData.has_therapist);
                setHasTherapist(chatData.has_therapist || false);
              }
            } catch (chatErr) {
              console.log('Home therapist check fallback error', chatErr);
              if (isActive) {
                setHasTherapist(false);
              }
            }
          }
        } catch (error) {
          console.log('Home screen load error', error);
        } finally {
          if (isActive) {
            setLoadingHome(false);
          }
        }
      };

      loadHomeData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const defaultName = useMemo(
    () =>
      user?.first_name?.trim()
        ? user.first_name
        : user?.username?.trim()
        ? user.username
        : 'Friend',
    [user]
  );

  const fallbackGreeting = useMemo(
    () => `Hey, welcome back ${defaultName}`,
    [defaultName]
  );

  const displayGreeting = greeting || fallbackGreeting;
  const fallbackQuote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );
  const displayQuote = quote || fallbackQuote;

  // Get milestone display info
  const getMilestoneDisplay = () => {
    if (!milestoneData?.latest_milestone) {
      return null;
    }
    
    const category = milestoneData.latest_category;
    const milestone = milestoneData.latest_milestone;
    
    const categoryLabels = {
      'journaling': 'Journaling',
      'mood': 'Mood Tracking',
      'tasks': 'Task Completion',
    };
    
    return {
      category: categoryLabels[category] || category,
      message: milestone.message,
      milestone: milestone.milestone,
    };
  };

  const milestoneDisplay = getMilestoneDisplay();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Top header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Notification')} 
          hitSlop={10}
          style={{ marginRight: spacing.md }}
        >
          <Feather name="bell" size={22} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={10}>
          <Feather name="settings" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['3xl'] + ms(70) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Professional Header */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingText}>
            {displayGreeting}
          </Text>
          <Text style={styles.subtitle}>Welcome to your wellness dashboard</Text>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteIcon}>💭</Text>
            <Text style={styles.quote}>"{displayQuote}"</Text>
          </View>
        </View>

        {/* Journal Reminder card */}
        <View style={[styles.cardRow, { backgroundColor: isDark ? surfaceColor : colors.white }]}>
          <View style={styles.cardLeft}>
            <Text style={[styles.cardLabel, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.7 : 1 }]}>Journal Reminder</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>Reflect on your day</Text>
            <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1 }]}>
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
            style={[styles.cardRight, { backgroundColor: isDark ? '#3D2A2A' : '#F6D7D0' }]}
            onPress={() => navigation.navigate('Journal')}
            activeOpacity={0.9}
          >
            <Image source={IMAGES.s1} style={styles.cardImg} />
          </TouchableOpacity>
        </View>

        {/* Today's Mood card */}
        <View style={[styles.cardRow, { backgroundColor: isDark ? surfaceColor : colors.white }]}>
          <View style={styles.cardLeft}>
            <Text style={[styles.cardLabel, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.7 : 1 }]}>Today's Mood</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>Feeling good</Text>
            <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1 }]}>Happy</Text>
            <TouchableOpacity
              style={styles.pill}
              onPress={() => navigation.navigate('MoodTracker')}
            >
              <Text style={styles.pillText}>Update</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.cardRight, { backgroundColor: isDark ? '#2A1F3D' : '#EFE7FB' }]}
            onPress={() => navigation.navigate('MoodTracker')}
            activeOpacity={0.9}
          >
            <Image source={IMAGES.s2} style={styles.cardImg} />
          </TouchableOpacity>
        </View>

        {/* Dashboard card */}
        <TouchableOpacity
          style={[styles.cardRow, { backgroundColor: isDark ? surfaceColor : colors.white }]}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.9}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.cardLabel, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.7 : 1 }]}>Your Progress</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>View Your Journey</Text>
            <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1 }]}>
              See how far you've come on your wellness journey ✨
            </Text>
            <TouchableOpacity
              style={[styles.pill, { backgroundColor: isDark ? '#CBA4F4' : '#2D5A27' }]}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.pillText}>View Dashboard</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.cardRight, { backgroundColor: isDark ? '#2A1F3D' : '#E8F5E9' }]}>
            <Feather name="bar-chart-2" size={48} color={isDark ? '#CBA4F4' : '#2D5A27'} />
          </View>
        </TouchableOpacity>

        {/* Talk to Your Doctor Card - Always visible */}
        <TouchableOpacity
          style={[styles.cardRow, { backgroundColor: isDark ? surfaceColor : colors.white }]}
          onPress={() => navigation.navigate('TalkToDoctor')}
          activeOpacity={0.9}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.cardLabel, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.7 : 1 }]}>💬 Talk to Your Doctor</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>Connect with Your Therapist</Text>
            <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1 }]}>
              Share your thoughts and concerns in a safe, supportive space 🌟
            </Text>
            <TouchableOpacity
              style={[styles.pill, { backgroundColor: isDark ? '#3B82F6' : '#3B82F6', marginTop: spacing.xs }]}
              onPress={() => navigation.navigate('TalkToDoctor')}
            >
              <Text style={styles.pillText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.cardRight, { backgroundColor: isDark ? '#1E3A5F' : '#E3F2FD' }]}>
            <Feather name="message-circle" size={40} color={isDark ? '#3B82F6' : '#3B82F6'} />
          </View>
        </TouchableOpacity>

        {/* Daily Tip Card */}
        {dailyTip && (
          <View style={[styles.cardRow, { backgroundColor: isDark ? surfaceColor : colors.white }]}>
            <View style={styles.cardLeft}>
              <Text style={[styles.cardLabel, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.7 : 1 }]}>💡 Daily Tip</Text>
              <Text style={[styles.cardTitle, { color: textColor, fontSize: 16 }]}>{dailyTip.title}</Text>
              <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1, marginTop: spacing.xs }]}>
                {dailyTip.content}
              </Text>
            </View>
            <View style={[styles.cardRight, { backgroundColor: isDark ? '#2A1F3D' : '#FFF4E6', width: ms(80), height: ms(80) }]}>
              <Feather name="zap" size={36} color={isDark ? '#F59E0B' : '#F59E0B'} />
            </View>
          </View>
        )}

        {/* Gratitude Check-in Card */}
        <TouchableOpacity
          style={[styles.cardRow, { backgroundColor: isDark ? surfaceColor : colors.white }]}
          onPress={() => navigation.navigate('Gratitude')}
          activeOpacity={0.9}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.cardLabel, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.7 : 1 }]}>🙏 Gratitude Check-in</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              {gratitudeData?.has_entry ? 'You\'ve shared gratitude today' : 'What are you grateful for today?'}
            </Text>
            {gratitudeData?.has_entry && gratitudeData?.gratitude?.text ? (
              <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1, fontStyle: 'italic' }]} numberOfLines={2}>
                "{gratitudeData.gratitude.text}"
              </Text>
            ) : (
              <Text style={[styles.cardSub, { color: isDark ? textColor : colors.mutedText, opacity: isDark ? 0.8 : 1 }]}>
                Take a moment to reflect on something positive ✨
              </Text>
            )}
            <TouchableOpacity
              style={[styles.pill, { backgroundColor: isDark ? '#F59E0B' : '#F59E0B', marginTop: spacing.xs }]}
              onPress={() => navigation.navigate('Gratitude')}
            >
              <Text style={styles.pillText}>{gratitudeData?.has_entry ? 'Update' : 'Add Gratitude'}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.cardRight, { backgroundColor: isDark ? '#3D2A1F' : '#FFF4E6' }]}>
            <Feather name="heart" size={40} color={isDark ? '#F59E0B' : '#F59E0B'} />
          </View>
        </TouchableOpacity>

        {/* Tasks list */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Today's Tasks</Text>

        {hasPendingMeds && (
          <TouchableOpacity
            style={[styles.taskRow, { backgroundColor: surfaceColor }]}
            onPress={() => navigation.navigate('Medications')}
            activeOpacity={0.8}
          >
            <View style={[styles.taskIcon, { backgroundColor: '#CBA4F4' }]}>
              <Text style={styles.taskIconText}>💊</Text>
            </View>
            <View style={styles.taskTextWrap}>
              <Text style={[styles.taskTitle, { color: textColor }]}>Medicine Reminder</Text>
              <Text style={[styles.taskSub, { color: textColor, opacity: 0.7 }]}>Take your medication</Text>
            </View>
            <Text style={[styles.chevron, { color: textColor }]}>›</Text>
          </TouchableOpacity>
        )}

        {hasDueTasks && (
          <TouchableOpacity
            style={[styles.taskRow, { backgroundColor: surfaceColor }]}
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.8}
          >
            <View style={[styles.taskIcon, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.taskIconText}>📋</Text>
            </View>
            <View style={styles.taskTextWrap}>
              <Text style={[styles.taskTitle, { color: textColor }]}>Tasks Due Today</Text>
              <Text style={[styles.taskSub, { color: textColor, opacity: 0.7 }]}>You have tasks to complete</Text>
            </View>
            <Text style={[styles.chevron, { color: textColor }]}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.taskRow, { backgroundColor: surfaceColor }]}
          onPress={() => navigation.navigate('Affirmations')}
          activeOpacity={0.8}
        >
          <View style={[styles.taskIcon, { backgroundColor: '#CBA4F4' }]}>
            <Text style={styles.taskIconText}>☑️</Text>
          </View>
          <View style={styles.taskTextWrap}>
            <Text style={[styles.taskTitle, { color: textColor }]}>Affirmations</Text>
            <Text style={[styles.taskSub, { color: textColor, opacity: 0.7 }]}>Complete your daily affirmations</Text>
          </View>
          <Text style={[styles.chevron, { color: textColor }]}>›</Text>
        </TouchableOpacity>

        {/* Milestone Highlight */}
        {milestoneDisplay && (
          <View style={[styles.milestoneRow, { backgroundColor: surfaceColor }]}>
            <View style={styles.milestoneLeft}>
              <Text style={[styles.milestoneTitle, { color: textColor }]}>
                🎉 Milestone Achieved!
              </Text>
              <Text style={[styles.milestoneSub, { color: textColor, opacity: 0.8 }]}>
                {milestoneDisplay.message}
              </Text>
              <Text style={[styles.milestoneCategory, { color: textColor, opacity: 0.6 }]}>
                {milestoneDisplay.category}
              </Text>
            </View>
            <View style={[styles.cardRight, { backgroundColor: '#F6D7D0' }]}>
              <Image source={IMAGES.s3} style={styles.cardImg} />
            </View>
          </View>
        )}
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
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardLeft: { flex: 1 },
  cardLabel: { ...type.caption, color: colors.mutedText, marginBottom: spacing.xs },
  cardTitle: { ...type.h2, color: colors.text, marginBottom: spacing.xs },
  cardSub: { ...type.caption, color: colors.mutedText, marginBottom: spacing.md },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D5A27',
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: { 
    color: colors.white, 
    fontWeight: '600',
    fontSize: 13,
  },

  cardRight: {
    width: ms(100),
    height: ms(100),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImg: { width: '80%', height: '80%', borderRadius: radii.md },

  sectionTitle: {
    ...type.h2,
    paddingHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  taskIconText: { fontSize: 18 },
  taskTextWrap: { flex: 1 },
  taskTitle: { ...type.body, fontWeight: '600' },
  taskSub: { ...type.caption, marginTop: 2 },
  chevron: { fontSize: 20, marginLeft: spacing.md },

  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    marginTop: spacing['2xl'],
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  milestoneLeft: { flex: 1 },
  milestoneTitle: { ...type.h2, marginBottom: spacing.xs },
  milestoneSub: { ...type.body, marginBottom: spacing.xs, lineHeight: 20 },
  milestoneCategory: { ...type.caption, marginTop: spacing.xs },
  pillSecondary: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D5A27',
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#2D5A27',
  },
  pillSecondaryText: { 
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 13,
  },

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
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
