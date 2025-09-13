// src/screens/Signup.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';

export default function Signup({ navigation }) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing['3xl'] }} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Sign Up</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Inputs */}
      <View style={styles.inputsWrap}>
        <TextInput placeholder="Name" placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput placeholder="Email" placeholderTextColor={colors.mutedText} keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Password" placeholderTextColor={colors.mutedText} secureTextEntry style={styles.input} />
        <TextInput placeholder="Confirm Password" placeholderTextColor={colors.mutedText} secureTextEntry style={styles.input} />
        <TextInput placeholder="Gender" placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput
          placeholder="Why are you using this app?"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, styles.textarea]}
          multiline
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('ProfileSetup')}>
        <Text style={styles.primaryText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9}>
        <Text style={styles.googleText}>ⓖ  Sign up with Google</Text>
      </TouchableOpacity>

      {/* Footer link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Login</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const INPUT_HEIGHT = 52;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    justifyContent: 'space-between',
  },
  backIcon: { fontSize: 20, color: colors.text },
  title: { ...type.h2, color: colors.text },
  inputsWrap: { gap: spacing.md },
  input: {
    height: ms(INPUT_HEIGHT),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    ...type.body,
  },
  textarea: {
    height: ms(110),
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  primaryBtn: {
    height: ms(52),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
  primaryText: { ...type.h2, color: colors.white },
  googleBtn: {
    height: ms(48),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  googleText: { ...type.body, color: colors.white, fontWeight: '700' },
  footer: { marginTop: spacing['2xl'], alignItems: 'center', marginBottom: spacing.xl },
  footerText: { ...type.caption, color: colors.mutedText },
  footerLink: { color: colors.accent, fontWeight: '700' },
});
