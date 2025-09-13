import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";

export default function ProfileSetup({ navigation }) {
  const [form, setForm] = useState({
    fullName: "",
    profession: "",
    age: "",
    phone: "",
    city: "",
    country: "",
    maritalStatus: "",
    emergencyContact: "",
  });

  const setVal = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back + Title */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: "https://i.imgur.com/5EOyTDQ.png" }}
            style={styles.avatar}
          />
          <TouchableOpacity style={{ alignItems: "center", marginTop: 8 }}>
            <Text style={styles.uploadTitle}>Upload Photo</Text>
            <Text style={styles.uploadSubtitle}>Add a profile photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Label text="Full Name" />
        <Field
          placeholder="Enter your full name"
          value={form.fullName}
          onChangeText={(t) => setVal("fullName", t)}
        />

        <Label text="Profession" />
        <Field
          placeholder="Enter your profession"
          value={form.profession}
          onChangeText={(t) => setVal("profession", t)}
        />

        <Label text="Age" />
        <Field
          placeholder="Enter your age"
          keyboardType="numeric"
          value={form.age}
          onChangeText={(t) => setVal("age", t)}
        />

        <Label text="Phone Number" />
        <Field
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(t) => setVal("phone", t)}
        />

        <Label text="City" />
        <Field
          placeholder="Enter your city"
          value={form.city}
          onChangeText={(t) => setVal("city", t)}
        />

        <Label text="Country" />
        <Field
          placeholder="Enter your country"
          value={form.country}
          onChangeText={(t) => setVal("country", t)}
        />

        <Label text="Marital Status" />
        <Field
          placeholder="Select your marital status"
          value={form.maritalStatus}
          onChangeText={(t) => setVal("maritalStatus", t)}
        />

        <Label text="Emergency Contact" />
        <Field
          placeholder="Enter emergency contact"
          value={form.emergencyContact}
          onChangeText={(t) => setVal("emergencyContact", t)}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => navigation.replace("Home")}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Reusable components */
function Label({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}
function Field(props) {
  return <TextInput placeholderTextColor={colors.mutedText} style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl },
  backBtn: { marginBottom: spacing.lg },
  title: { ...type.h2, textAlign: "center", marginBottom: spacing.lg },
  avatarWrap: { alignItems: "center", marginBottom: spacing.lg },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  uploadTitle: { ...type.h3, color: colors.text },
  uploadSubtitle: { ...type.body, color: colors.mutedText },
  label: { ...type.caption, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    height: ms(52),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  saveBtn: {
    marginTop: spacing["2xl"],
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: ms(52),
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { ...type.h3, color: colors.white },
});
