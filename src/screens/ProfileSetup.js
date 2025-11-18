import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function ProfileSetup({ navigation, route }) {
  const user = route?.params?.user;
  const userId = user?.id;

  const [form, setForm] = useState({
    fullName: "",
    profession: "",
    age: "",
    phone: "",
    city: "",
    country: "",
    maritalStatus: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;

  const setVal = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validateForm = () => {
    const entries = Object.entries(form);
    for (const [key, value] of entries) {
      if (!String(value).trim()) {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (c) => c.toUpperCase());
        Alert.alert("Missing information", `${label} is required.`);
        return false;
      }
    }

    const ageNumber = Number(form.age);
    if (Number.isNaN(ageNumber) || ageNumber <= 0) {
      Alert.alert("Invalid age", "Please enter a valid age greater than zero.");
      return false;
    }

    if (!userId) {
      Alert.alert(
        "Missing user",
        "We could not determine the user for this profile. Please sign up again."
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!validateForm()) return;

    const payload = {
      user_id: userId,
      full_name: form.fullName.trim(),
      profession: form.profession.trim(),
      age: Number(form.age),
      phone: form.phone.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      marital_status: form.maritalStatus.trim(),
      emergency_contact_name: form.emergencyContactName.trim(),
      emergency_contact_relation: form.emergencyContactRelation.trim(),
      emergency_contact: form.emergencyContactPhone.trim(),
    };

    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/users/profile/setup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        const errors =
          typeof data === "object" && data !== null
            ? Object.values(data)[0]
            : "Unable to save profile. Please try again.";

        Alert.alert("Profile not saved", Array.isArray(errors) ? errors.join("\n") : errors);
        return;
      }

      const updatedUser = data?.profile?.user ?? {};
      await AsyncStorage.multiSet([
        ["userProfile", JSON.stringify(updatedUser)],
      ]);

      Alert.alert("Profile saved", "Your profile has been saved successfully.", [
        {
          text: "Go to Home",
          onPress: () => navigation.replace("Home", { user: updatedUser }),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Network error",
        "Could not reach the server. Make sure your backend is running and the URL is correct."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back + Title */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: textColor }]}>Profile</Text>

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

        <Label text="Emergency Contact Name" />
        <Field
          placeholder="Enter contact full name"
          value={form.emergencyContactName}
          onChangeText={(t) => setVal("emergencyContactName", t)}
        />

        <Label text="Emergency Contact Relation" />
        <Field
          placeholder="Enter relation (e.g., Mother, Friend)"
          value={form.emergencyContactRelation}
          onChangeText={(t) => setVal("emergencyContactRelation", t)}
        />

        <Label text="Emergency Contact Phone" />
        <Field
          placeholder="Enter emergency contact phone"
          keyboardType="phone-pad"
          value={form.emergencyContactPhone}
          onChangeText={(t) => setVal("emergencyContactPhone", t)}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save"}</Text>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  saveBtn: {
    marginTop: spacing["2xl"],
    backgroundColor: '#2D5A27',
    borderRadius: radii.pill,
    height: ms(52),
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { ...type.h3, color: colors.white },
});
