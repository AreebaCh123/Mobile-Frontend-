// src/screens/EditProfile.js
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

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    profession: '',
    city: '',
    country: '',
    maritalStatus: '',
    phone: '',
    email: '',
  });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const onSave = () => {
    // TODO: persist form
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        <View style={styles.form}>
          <Field
            label="Full Name"
            value={form.name}
            onChangeText={(t) => update('name', t)}
          />
          <Field
            label="Age"
            value={form.age}
            keyboardType="number-pad"
            onChangeText={(t) => update('age', t)}
          />
          <Field
            label="Profession"
            value={form.profession}
            onChangeText={(t) => update('profession', t)}
          />
          <Field
            label="City"
            value={form.city}
            onChangeText={(t) => update('city', t)}
          />
          <Field
            label="Country"
            value={form.country}
            onChangeText={(t) => update('country', t)}
          />
          <Field
            label="Marital Status"
            value={form.maritalStatus}
            onChangeText={(t) => update('maritalStatus', t)}
          />
          <Field
            label="Phone Number"
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(t) => update('phone', t)}
          />
          <Field
            label="Email"
            value={form.email}
            keyboardType="email-address"
            onChangeText={(t) => update('email', t)}
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
          <Text style={styles.primaryText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedText}
        style={styles.input}
        {...inputProps}
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
    marginTop: spacing.lg,
  },
  primaryText: { ...type.h2, color: colors.white },
});
