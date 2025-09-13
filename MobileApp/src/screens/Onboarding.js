// src/screens/Onboarding.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';

export default function Onboarding({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.centerWrap}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={styles.cta}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Login')}

      >
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing['3xl'],
    justifyContent: 'space-between',
  },
  centerWrap: {
    flex: 1,                        // take all available vertical space
    alignItems: 'center',           // center horizontally
    justifyContent: 'center',       // center vertically
  },
  logo: {
    width: ms(180),
    height: ms(180),
    marginBottom: spacing.md,
  },
  appName: {
    ...type.h2,
    color: colors.text,
  },
  cta: {
    height: ms(54),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...type.h2,
    color: colors.white,
    fontWeight: '700',
  },
});
