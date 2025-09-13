// src/screens/Login.js
import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';

export default function Login({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Login</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Inputs */}
      <View style={styles.inputsWrap}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.mutedText}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.mutedText}
          secureTextEntry
          style={[styles.input, { marginTop: spacing.md }]}
        />
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Login */}
      <TouchableOpacity
        style={styles.primaryBtn}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.primaryText}>Login</Text>
      </TouchableOpacity>

      {/* Google (stub) */}
      <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9}>
        <Text style={styles.googleText}>Login with Google</Text>
      </TouchableOpacity>

      {/* Footer link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don’t have an account?{' '}
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
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
  backIcon: {
    fontSize: 20,
    color: colors.text,
    paddingRight: spacing.md,
  },
  title: {
    ...type.h2,
    color: colors.text,
  },
  inputsWrap: {
    gap: spacing.md,
  },
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
  forgotBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  forgotText: {
    ...type.caption,
    color: colors.accent,
  },
  primaryBtn: {
    height: ms(52),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  primaryText: {
    ...type.h2,
    color: colors.white,
  },
  googleBtn: {
    height: ms(52),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  googleText: {
    ...type.h2,
    color: colors.white,
  },
  footer: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    ...type.caption,
    color: colors.mutedText,
  },
  footerLink: {
    color: colors.accent,
    fontWeight: '700',
  },
});
