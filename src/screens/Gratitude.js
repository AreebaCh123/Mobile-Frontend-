// src/screens/Gratitude.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type, radii } from '../themes/tokens';
import { ms } from '../themes/scale';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

export default function Gratitude({ navigation }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const loadGratitude = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/gratitude/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.has_entry && data.gratitude) {
          setText(data.gratitude.text);
        } else {
          setText('');
        }
      } else {
        if (response.status === 401) {
          navigation.navigate('Login');
        }
      }
    } catch (error) {
      console.error('Error loading gratitude:', error);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadGratitude();
    }, [loadGratitude])
  );

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Required', 'Please write something you are grateful for.');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals/gratitude/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your gratitude has been saved!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to save gratitude');
      }
    } catch (error) {
      console.error('Error saving gratitude:', error);
      Alert.alert('Error', 'Failed to save gratitude');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={isDark ? '#CBA4F4' : '#2D5A27'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Gratitude Check-in</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.infoIcon, { color: textColor }]}>🙏</Text>
          <Text style={[styles.infoTitle, { color: textColor }]}>What are you grateful for today?</Text>
          <Text style={[styles.infoText, { color: textColor, opacity: 0.7 }]}>
            Take a moment to reflect on something positive in your life. This practice can help improve your mood and overall well-being.
          </Text>
        </View>

        {/* Input Section */}
        <View style={[styles.inputCard, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Your Gratitude</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#0F0F14' : '#F8F9FA',
                color: textColor,
                borderColor: isDark ? '#2A2A2F' : colors.border,
              },
            ]}
            placeholder="Write what you're grateful for today..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={[styles.hint, { color: textColor, opacity: 0.5 }]}>
            {text.length} characters
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: saving ? '#999' : '#F59E0B',
              opacity: saving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Gratitude</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  infoCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...type.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  infoText: {
    ...type.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...type.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    ...type.body,
    minHeight: ms(120),
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  hint: {
    ...type.caption,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  saveButton: {
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    ...type.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

