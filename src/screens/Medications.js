import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function Medications({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? "#050509" : colors.bg;
  const textColor = isDark ? "#FFFFFF" : colors.text;

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setError("Session expired. Please log in again.");
        setItems([]);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/journals/medications/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        console.log("Medications fetch error:", data);
        setError("Unable to load medications.");
        setItems([]);
        return;
      }
      setItems(data?.medications || []);
    } catch (err) {
      console.log("Medications network error:", err);
      setError("Unable to load medications. Check your connection.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMedications();
    }, [])
  );

  const toggleTaken = async (id, currentTaken) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/journals/medications/${id}/take/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taken: !currentTaken }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.log("Update medication error:", data);
        return;
      }
      setItems((prev) =>
        prev.map((it) =>
          it.id === data.medication.id ? data.medication : it
        )
      );
    } catch (err) {
      console.log("Update medication network error:", err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.dose}>{item.dosage}</Text>

        <TouchableOpacity
          onPress={() => toggleTaken(item.id, item.taken_today)}
          activeOpacity={0.9}
          style={[styles.pill, item.taken_today ? styles.pillOn : styles.pillOff]}
        >
          <Text style={[styles.pillText, item.taken_today && styles.pillTextOn]}>
            {item.taken_today ? "Taken  ✓" : "Not Taken  ✕"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.medIconContainer}>
        <Text style={styles.medIcon}>{item.emoji}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Medications</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddMedication")}
          hitSlop={10}
          >
            <Feather name="plus" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      {error && (
        <Text
          style={{
            ...type.caption,
            color: "#EF4444",
            paddingHorizontal: spacing.xl,
            marginBottom: spacing.sm,
          }}
        >
          {error}
        </Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing["3xl"],
          paddingTop: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadMedications}
      />
    </SafeAreaView>
  );
}

const TH = ms(88);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.md,
  },
  title: { ...type.h2, color: colors.text },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: 4 },
  dose: { ...type.caption, color: colors.accent, marginBottom: spacing.sm },

  pill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingVertical: ms(6),
    paddingHorizontal: ms(12),
  },
  pillOn: { backgroundColor: '#2D5A27' },
  pillOff: { backgroundColor: "#E7DDF9" },
  pillText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  pillTextOn: { color: "#fff" },

  medIconContainer: {
    width: TH,
    height: TH,
    borderRadius: radii.lg,
    marginLeft: spacing.md,
    backgroundColor: '#F0E6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medIcon: {
    fontSize: 24,
  },
});
