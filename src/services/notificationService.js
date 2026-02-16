// src/services/notificationService.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';
const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Save notification to storage when received
    await saveNotificationToStorage({
      id: Date.now().toString(),
      type: notification.request.content.data?.type || 'general',
      title: notification.request.content.title,
      message: notification.request.content.body,
      time: new Date().toISOString(),
      read: false,
    });

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Save notification to AsyncStorage
export async function saveNotificationToStorage(notification) {
  try {
    const existing = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const notifications = existing ? JSON.parse(existing) : [];

    // Check for duplicates (same title and message within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const isDuplicate = notifications.some(n =>
      n.title === notification.title &&
      n.message === notification.message &&
      n.time > twoMinutesAgo
    );

    if (!isDuplicate) {
      // Add new notification at the beginning
      notifications.unshift(notification);

      // Keep only last 100 notifications
      const limited = notifications.slice(0, 100);

      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(limited));
    }
  } catch (error) {
    console.log('Error saving notification:', error);
  }
}

// Get all notifications from storage
export async function getNotificationsFromStorage() {
  try {
    const existing = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.log('Error getting notifications:', error);
    return [];
  }
}

// Clear all notifications
export async function clearAllNotifications() {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.log('Error clearing notifications:', error);
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  try {
    const notifications = await getNotificationsFromStorage();
    const updated = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.log('Error marking notification as read:', error);
  }
}

// Request permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  return true;
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel notifications by identifier
export async function cancelNotification(identifier) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Schedule a notification
export async function scheduleNotification(title, body, trigger, data = {}) {
  try {
    // If trigger is soon (within 10 minutes), save to storage immediately
    // This ensures notifications appear in the Notification.js screen right away
    if (trigger.seconds !== undefined && trigger.seconds <= 10 * 60) {
      await saveNotificationToStorage({
        id: `scheduled_${Date.now()}_${Math.random()}`,
        type: data.type || 'general',
        title,
        message: body,
        time: new Date().toISOString(),
        read: false,
      });
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
      },
      trigger,
    });
    return identifier;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
}

// Schedule task reminders (every 10 minutes if 1 hour left)
export async function scheduleTaskReminders(tasks, preferences) {
  if (!preferences.task_reminders) return;

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  for (const task of tasks) {
    if (task.completed) continue;

    const dueDate = new Date(task.due_date);
    const dueTime = new Date(dueDate);
    if (task.due_time) {
      const [hours, minutes] = task.due_time.split(':');
      dueTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Check if task is due within 1 hour
    const timeUntilDue = dueTime.getTime() - now.getTime();
    if (timeUntilDue > 0 && timeUntilDue <= 60 * 60 * 1000) {
      // Schedule notifications every 10 minutes until due time
      let notificationTime = new Date(now.getTime() + 10 * 60 * 1000); // First in 10 minutes

      while (notificationTime <= dueTime) {
        const secondsUntilNotification = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);

        if (secondsUntilNotification > 0) {
          await scheduleNotification(
            `Task Reminder: ${task.title}`,
            `Your task "${task.title}" is due soon!`,
            { seconds: secondsUntilNotification },
            { type: 'task', taskId: task.id }
          );
        }

        notificationTime = new Date(notificationTime.getTime() + 10 * 60 * 1000); // Every 10 minutes
      }
    }
  }
}

// Schedule medication reminders (every 10 minutes if 1 hour left)
export async function scheduleMedicationReminders(medications, preferences) {
  if (!preferences.medication_reminders) return;

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  for (const med of medications) {
    // Check pending intakes for today
    const pendingIntakes = (med.intakes || []).filter(
      intake => !intake.taken && intake.date === todayStr
    );

    if (pendingIntakes.length === 0) continue;

    // For medications, we'll schedule a reminder if there's a pending intake
    // Since we don't have exact scheduled times, we'll schedule for 1 hour from now
    // and then every 10 minutes after that until end of day
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Schedule first reminder in 1 hour (if within today)
    if (oneHourFromNow <= endOfDay) {
      let notificationTime = oneHourFromNow;

      while (notificationTime <= endOfDay) {
        const secondsUntilNotification = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);

        if (secondsUntilNotification > 0 && secondsUntilNotification <= 24 * 60 * 60) {
          await scheduleNotification(
            `Medication Reminder: ${med.name}`,
            `Time to take ${med.name} (${med.dosage})`,
            { seconds: secondsUntilNotification },
            { type: 'medication', medicationId: med.id }
          );
        }

        notificationTime = new Date(notificationTime.getTime() + 10 * 60 * 1000); // Every 10 minutes
      }
    }
  }
}

// Schedule journal reminder (before 12 AM if not written today)
export async function scheduleJournalReminder(hasJournalToday, preferences) {
  if (!preferences.journal_reminders) return;
  if (hasJournalToday) return; // Already written today

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight

  // Schedule reminder 30 minutes before midnight (11:30 PM)
  const reminderTime = new Date(midnight.getTime() - 30 * 60 * 1000);

  const secondsUntilReminder = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

  if (secondsUntilReminder > 0) {
    await scheduleNotification(
      'Journal Reminder',
      "You haven't written in your journal today. Take a moment to reflect!",
      { seconds: secondsUntilReminder },
      { type: 'journal' }
    );
  }
}

// Schedule mood reminder (before 12 AM if not logged today)
export async function scheduleMoodReminder(hasMoodToday, preferences) {
  if (!preferences.mood_reminders) return;
  if (hasMoodToday) return; // Already logged today

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight

  // Schedule reminder 30 minutes before midnight (11:30 PM)
  const reminderTime = new Date(midnight.getTime() - 30 * 60 * 1000);

  const secondsUntilReminder = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

  if (secondsUntilReminder > 0) {
    await scheduleNotification(
      'Mood Reminder',
      "You haven't logged your mood today. How are you feeling?",
      { seconds: secondsUntilReminder },
      { type: 'mood' }
    );
  }
}

// Add milestone notification (only if not already added today)
export async function addMilestoneNotification(milestoneData) {
  if (!milestoneData) return;

  const existing = await getNotificationsFromStorage();
  const today = new Date().toISOString().split('T')[0];

  // Check if milestone notifications were already added today
  const todayMilestones = existing.filter(n =>
    n.type === 'milestone' && n.time?.split('T')[0] === today
  );

  const { journaling, mood, tasks } = milestoneData;

  // Check for journaling milestone
  if (journaling?.days && journaling.days >= 7 && journaling.milestone) {
    const alreadyAdded = todayMilestones.some(n => n.message?.includes('journaling'));
    if (!alreadyAdded) {
      await saveNotificationToStorage({
        id: `milestone_journal_${Date.now()}`,
        type: 'milestone',
        title: '🎉 Milestone Achieved!',
        message: journaling.message || `You've completed ${journaling.days} days of journaling!`,
        time: new Date().toISOString(),
        read: false,
      });
    }
  }

  // Check for mood milestone
  if (mood?.days && mood.days >= 7 && mood.milestone) {
    const alreadyAdded = todayMilestones.some(n => n.message?.includes('mood tracking'));
    if (!alreadyAdded) {
      await saveNotificationToStorage({
        id: `milestone_mood_${Date.now()}`,
        type: 'milestone',
        title: '📊 Milestone Achieved!',
        message: mood.message || `You've completed ${mood.days} days of mood tracking!`,
        time: new Date().toISOString(),
        read: false,
      });
    }
  }

  // Check for task milestone
  if (tasks?.days && tasks.days >= 7 && tasks.milestone) {
    const alreadyAdded = todayMilestones.some(n => n.message?.includes('task completion'));
    if (!alreadyAdded) {
      await saveNotificationToStorage({
        id: `milestone_tasks_${Date.now()}`,
        type: 'milestone',
        title: '✅ Milestone Achieved!',
        message: tasks.message || `You've completed ${tasks.days} days of task completion!`,
        time: new Date().toISOString(),
        read: false,
      });
    }
  }
}

// Main function to schedule all notifications
export async function scheduleAllNotifications(tasks, medications, hasJournalToday, hasMoodToday, preferences, milestoneData = null) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return;
  }

  await cancelAllNotifications();

  await scheduleTaskReminders(tasks, preferences);
  await scheduleMedicationReminders(medications, preferences);
  await scheduleJournalReminder(hasJournalToday, preferences);
  await scheduleMoodReminder(hasMoodToday, preferences);

  // Add milestone notifications if any
  if (milestoneData) {
    await addMilestoneNotification(milestoneData);
  }
}

