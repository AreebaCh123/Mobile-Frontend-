// src/screens/Notification.js
import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import { ThemeContext } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { getNotificationsFromStorage, clearAllNotifications, markNotificationAsRead } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

export default function Notification({ navigation }) {
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await getNotificationsFromStorage();
      setNotifications(stored);
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      
      // Set up notification listener
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        // Reload notifications when a new one is received
        loadNotifications();
      });
      
      return () => {
        subscription.remove();
      };
    }, [loadNotifications])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications();
            setNotifications([]);
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      await loadNotifications();
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return time.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'reminder':
      case 'medication':
        return 'bell';
      case 'task':
        return 'check-circle';
      case 'milestone':
        return 'award';
      case 'journal':
        return 'book-open';
      case 'mood':
        return 'heart';
      case 'tip':
        return 'zap';
      default:
        return 'info';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'reminder':
      case 'medication':
        return '#F59E0B';
      case 'task':
        return '#3B82F6';
      case 'milestone':
        return '#CBA4F4';
      case 'journal':
        return '#4CAF50';
      case 'mood':
        return '#EF4444';
      case 'tip':
        return '#10B981';
      default:
        return '#666';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: isDark ? '#2A2A2F' : colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} hitSlop={10}>
            <Text style={[styles.clearButton, { color: '#EF4444' }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.unreadText, { color: textColor }]}>
            {unreadCount} {unreadCount === 1 ? 'unread notification' : 'unread notifications'}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={64} color={isDark ? '#444' : '#CCC'} />
            <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtext, { color: textColor, opacity: 0.4 }]}>
              Notifications will appear here when you receive reminders
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
                  borderColor: isDark ? '#2A2A2F' : colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(notification)}
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
                  <Text style={[styles.notificationTitle, { color: textColor }]} numberOfLines={1}>
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: '#3B82F6' }]} />
                  )}
                </View>
                <Text style={[styles.notificationMessage, { color: textColor, opacity: 0.8 }]} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: textColor, opacity: 0.5 }]}>
                  {formatTime(notification.time)}
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
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...type.h2,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    ...type.body,
    fontWeight: '600',
  },
  unreadBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  unreadText: {
    ...type.caption,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  emptySubtext: {
    ...type.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
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
