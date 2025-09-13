// src/screens/EmergencyContact.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radii, type } from '../themes/tokens';
import { ms } from '../themes/scale';

export default function EmergencyContact({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    relation: '',
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = () => {
    // TODO: persist contact
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Contact</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        <View style={styles.form}>
          <Field
            label="Contact Name"
            value={form.name}
            onChangeText={(t) => update('name', t)}
          />
          <Field
            label="Phone Number"
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(t) => update('phone', t)}
          />
          <Field
            label="Relation"
            value={form.relation}
            onChangeText={(t) => update('relation', t)}
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
          <Text style={styles.primaryText}>Update Emergency Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedText}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const INPUT_H = 52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerTitle: { ...type.h2, color: colors.text },
  form: { paddingHorizontal: spacing.xl },
  label: { ...type.body, color: colors.text, marginBottom: spacing.sm },
  input: {
    height: ms(INPUT_H),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    ...type.body,
  },
  primaryBtn: {
    height: ms(52),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
  },
  primaryText: { ...type.h2, color: colors.white, textAlign: 'center' },
});
