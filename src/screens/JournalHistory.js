// src/screens/JournalHistory.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { colors, spacing, radii, type } from "../themes/tokens";
import { ms } from "../themes/scale";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function JournalHistory({ navigation }) {
  const entriesRef = useRef([]);
  const [sections, setSections] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("authToken")
      .then((token) => {
        setAuthToken(token);
        if (token) {
          fetchEntries(0, token, true);
        }
      })
      .catch(() => {});
  }, []);

  const fetchEntries = useCallback(
    async (targetPage = 0, token = authToken, reset = false) => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/journals/entries/?page=${targetPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Unable to load journal history.");
        }
        const nextEntries = reset
          ? data.entries || []
          : [...entriesRef.current, ...(data.entries || [])];
        entriesRef.current = nextEntries;
        setSections(groupEntriesByDate(nextEntries));
        setHasMore(Boolean(data.has_more));
        setPage(targetPage);
      } catch (error) {
        console.log("Journal history error:", error);
        Alert.alert("Error", error.message || "Unable to load journal history.");
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    },
    [authToken]
  );

  const groupEntriesByDate = (entries = []) => {
    const groups = entries.reduce((acc, entry) => {
      const dateObj = new Date(entry.created_at);
      const label = formatRelativeDate(dateObj);
      if (!acc[label]) acc[label] = [];
      acc[label].push({ ...entry, dateObj });
      return acc;
    }, {});

    return Object.keys(groups)
      .sort((a, b) => {
        const firstDate = groups[b][0].dateObj - groups[a][0].dateObj;
        return firstDate;
      })
      .map((label) => ({
        title: label,
        data: groups[label].sort((a, b) => b.dateObj - a.dateObj),
      }));
  };

  const formatRelativeDate = (dateObj) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEntry = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const diffDays = Math.round((startOfToday - startOfEntry) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 10) return `${diffDays} Days Ago`;

    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const renderItem = ({ item }) => {
    const timestamp = item.dateObj || new Date(item.created_at);
    const timeString = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const metaParts = [
      timeString,
      item.source_type === "voice" ? "Voice" : "Text",
      item.shared_with_doctor ? "Shared" : null,
    ].filter(Boolean);

    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={3}>
            {item.content}
          </Text>
          <Text style={styles.rowMeta}>{metaParts.join(" • ")}</Text>
        </View>
        <Feather name="mic" size={16} color={item.source_type === "voice" ? colors.primary : colors.border} />
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={() => fetchEntries(page + 1)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.loadMoreText}>View Earlier 10 Days</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal History</Text>
        <View style={{ width: 22 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.id}`}
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          initialLoaded && (
            <Text style={styles.emptyText}>
              No journal entries in the last 10 days. Start writing to see your history here.
            </Text>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        refreshControl={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.md,
  },
  headerTitle: { ...type.h2, color: colors.text },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...type.body,
    color: colors.mutedText,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...type.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowTitle: {
    ...type.body,
    color: colors.text,
    marginBottom: 4,
  },
  rowMeta: {
    ...type.caption,
    color: colors.accent,
  },
  separator: { height: spacing.md },
  loadMoreButton: {
    marginTop: spacing.lg,
    alignSelf: "center",
    backgroundColor: "#2D5A27",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  loadMoreText: {
    ...type.body,
    color: colors.white,
    fontWeight: "600",
  },
});
