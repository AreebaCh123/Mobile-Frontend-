// src/screens/Notification.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import { ThemeContext } from '../context/ThemeContext';

export default function Notification({ navigation }) {
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  // Sample notifications - you can replace this with actual data from backend
  const [notifications] = useState([
    {
      id: 1,
      type: 'reminder',
      title: 'Medication Reminder',
      message: 'Time to take your morning medication',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'task',
      title: 'Task Due Today',
      message: 'You have 3 tasks due today',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'milestone',
      title: 'Milestone Achieved!',
      message: 'You\'ve completed 7 days of journaling!',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'tip',
      title: 'Daily Tip',
      message: 'Remember to take breaks and practice mindfulness',
      time: '2 days ago',
      read: true,
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'reminder':
        return 'bell';
      case 'task':
        return 'check-circle';
      case 'milestone':
        return 'award';
      case 'tip':
        return 'zap';
      default:
        return 'info';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'reminder':
        return '#F59E0B';
      case 'task':
        return '#3B82F6';
      case 'milestone':
        return '#CBA4F4';
      case 'tip':
        return '#10B981';
      default:
        return '#666';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={64} color={isDark ? '#444' : '#CCC'} />
            <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
              No notifications yet
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: surfaceColor,
                  borderLeftColor: getIconColor(notification.type),
                  opacity: notification.read ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) + '20' }]}>
                <Feather
                  name={getIcon(notification.type)}
                  size={24}
                  color={getIconColor(notification.type)}
                />
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.notificationTitle, { color: textColor }]}>
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text style={[styles.notificationMessage, { color: textColor, opacity: 0.8 }]}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: textColor, opacity: 0.5 }]}>
                  {notification.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...type.h2,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...type.body,
    marginTop: spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: ms(48),
    height: ms(48),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...type.body,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: spacing.xs,
  },
  notificationMessage: {
    ...type.body,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  notificationTime: {
    ...type.caption,
    fontSize: 12,
  },
});

