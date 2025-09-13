import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

const IMG = {
  thought: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=640&q=80",
  cog: "https://images.unsplash.com/photo-1554774853-b414d2a2ea2b?w=640&q=80",
  box: "https://images.unsplash.com/photo-1587502534644-34f56c5a3c7b?w=640&q=80",
  breathe478: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=640&q=80",
  bodyscan: "https://images.unsplash.com/photo-1517999144091-3d9b7bcae4d8?w=640&q=80",
  grounding: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80",
};

const DATA = [
  {
    section: "CBT Tools",
    items: [
      {
        id: "thought",
        title: "Thought Record",
        subtitle: "Identify and challenge negative thoughts",
        duration: "5–10 min",
        type: "CBT",
        image: IMG.thought,
        steps: [
          "Describe the situation and emotions.",
          "Write your automatic thought.",
          "List evidence for and against.",
          "Create a balanced alternative thought.",
        ],
      },
      {
        id: "cognitive",
        title: "Cognitive Restructuring",
        subtitle: "Reframe unhelpful thinking patterns",
        duration: "6–8 min",
        type: "CBT",
        image: IMG.cog,
        steps: [
          "Spot the thinking trap.",
          "Challenge it with questions.",
          "Replace with a more helpful view.",
        ],
      },
    ],
  },
  {
    section: "Breathing Exercises",
    items: [
      {
        id: "box",
        title: "Box Breathing",
        subtitle: "Calm your body and mind",
        duration: "2–4 min",
        type: "Breathing",
        image: IMG.box,
        steps: [
          "Inhale 4s • Hold 4s • Exhale 4s • Hold 4s.",
          "Repeat for 4–6 cycles.",
        ],
      },
      {
        id: "478",
        title: "4-7-8 Breathing",
        subtitle: "Promote relaxation and sleep",
        duration: "2–3 min",
        type: "Breathing",
        image: IMG.breathe478,
        steps: [
          "Inhale through your nose for 4 seconds.",
          "Hold your breath for 7 seconds.",
          "Exhale slowly through your mouth for 8 seconds.",
          "Repeat 4–8 cycles.",
        ],
      },
    ],
  },
  {
    section: "Mindfulness",
    items: [
      {
        id: "bodyscan",
        title: "Body Scan",
        subtitle: "Increase body awareness",
        duration: "5–12 min",
        type: "Mindfulness",
        image: IMG.bodyscan,
        steps: [
          "Scan slowly from head to toes.",
          "Notice sensations without judging.",
          "Breathe into areas of tension.",
        ],
      },
      {
        id: "grounding",
        title: "Grounding Techniques",
        subtitle: "Connect with the present moment",
        duration: "3–5 min",
        type: "Mindfulness",
        image: IMG.grounding,
        steps: [
          "5-4-3-2-1: name things you can See, Touch, Hear, Smell, Taste.",
        ],
      },
    ],
  },
];

export default function SelfHelpTools({ navigation }) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState(null); // CBT | Breathing | Mindfulness | null

  const flatItems = useMemo(
    () =>
      DATA.flatMap((sec) =>
        sec.items.map((it) => ({ ...it, _section: sec.section }))
      ),
    []
  );

  const filtered = useMemo(() => {
    return flatItems.filter((it) => {
      const okType = !typeFilter || it.type === typeFilter;
      const okQuery =
        !q ||
        it.title.toLowerCase().includes(q.toLowerCase()) ||
        it.subtitle.toLowerCase().includes(q.toLowerCase());
      return okType && okQuery;
    });
  }, [q, typeFilter, flatItems]);

  const sections = useMemo(() => {
    const by = {};
    filtered.forEach((it) => {
      by[it._section] = by[it._section] || [];
      by[it._section].push(it);
    });
    return Object.entries(by).map(([name, items]) => ({ name, items }));
  }, [filtered]);

  const onOpen = (item) => navigation.navigate("ExerciseDetail", { exercise: item });

  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImg} />
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.cardSub} numberOfLines={2}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Self-Help Tools</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color={colors.accent} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tools"
          placeholderTextColor={colors.accent}
          value={q}
          onChangeText={setQ}
        />
      </View>

      {/* Quick filters (Type / Duration placeholder) */}
      <View style={styles.filtersRow}>
        {["CBT", "Breathing", "Mindfulness"].map((t) => {
          const active = typeFilter === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTypeFilter(active ? null : t)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.filterChip} activeOpacity={0.9}>
          <Text style={styles.filterText}>Duration</Text>
          <Feather name="chevron-down" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Sections with 2-column grids */}
      <FlatList
        data={sections}
        keyExtractor={(s) => s.name}
        contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
        renderItem={({ item: sec }) => (
          <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
            <Text style={styles.sectionTitle}>{sec.name}</Text>
            <FlatList
              data={sec.items}
              keyExtractor={(it) => it.id}
              renderItem={renderCard}
              numColumns={2}
              columnWrapperStyle={{ gap: spacing.md }}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const CARD = { w: ms(140), h: ms(160) };

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

  searchRow: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: ms(44),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: { flex: 1, ...type.body, color: colors.text },

  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: ms(10),
    paddingVertical: ms(6),
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  filterTextActive: { color: "#fff" },

  sectionTitle: { ...type.h2, color: colors.text, marginBottom: spacing.sm },

  card: {
    width: CARD.w,
    height: CARD.h,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  cardImg: {
    width: "100%",
    height: ms(90),
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    backgroundColor: "#F2F2F2",
  },
  cardTitle: { ...type.body, color: colors.text, fontWeight: "700" },
  cardSub: { ...type.caption, color: colors.mutedText },
});
