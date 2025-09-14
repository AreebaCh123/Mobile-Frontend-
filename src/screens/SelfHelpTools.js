import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";

const IMG = {
  thought: "🧠",
  cog: "🔄",
  box: "📦",
  breathe478: "🌬️",
  bodyscan: "🧘",
  grounding: "🌱",
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
  const [durationFilter, setDurationFilter] = useState(null); // 1-5 | 5-10 | 10-15 | 15-30 | 30+ | null
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

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
      
      // Duration filtering logic
      let okDuration = true;
      if (durationFilter) {
        const duration = it.duration;
        switch (durationFilter) {
          case '1-5':
            okDuration = duration.includes('2-4') || duration.includes('3-5') || duration.includes('1-3');
            break;
          case '5-10':
            okDuration = duration.includes('5-10') || duration.includes('6-8');
            break;
          case '10-15':
            okDuration = duration.includes('10-15') || duration.includes('12-15');
            break;
          case '15-30':
            okDuration = duration.includes('15-30') || duration.includes('20-30');
            break;
          case '30+':
            okDuration = duration.includes('30+') || duration.includes('45+');
            break;
        }
      }
      
      return okType && okQuery && okDuration;
    });
  }, [q, typeFilter, durationFilter, flatItems]);

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
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)} activeOpacity={0.8}>
      <View style={styles.cardImageContainer}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emojiIcon}>{item.image}</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSub} numberOfLines={2}>{item.subtitle}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
      </View>
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

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Quick filters - All in one row */}
        <View style={styles.filtersContainer}>
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
            
            {/* Duration filter in same row */}
            <TouchableOpacity 
              style={[styles.durationChip, durationFilter && styles.durationChipActive]} 
              onPress={() => setShowDurationDropdown(!showDurationDropdown)}
              activeOpacity={0.9}
            >
              <Text style={[styles.durationText, durationFilter && styles.durationTextActive]}>
                {durationFilter ? `${durationFilter} min` : 'Duration'}
              </Text>
              <Feather name="chevron-down" size={16} color={durationFilter ? '#fff' : colors.accent} />
            </TouchableOpacity>
            
            {/* Duration dropdown */}
            {showDurationDropdown && (
              <View style={styles.dropdown}>
                {['1-5', '5-10', '10-15', '15-30', '30+'].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setDurationFilter(durationFilter === duration ? null : duration);
                      setShowDurationDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{duration} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {sections.length > 0 ? (
            <View style={styles.cardsGrid}>
              {sections.flatMap(sec => sec.items).map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  {renderCard({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={colors.mutedText} />
              <Text style={styles.emptyTitle}>No tools found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD = { w: ms(160), h: ms(200) };

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: { ...type.h2, color: colors.text },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing['3xl'],
  },

  searchRow: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: ms(52),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: { flex: 1, ...type.body, color: colors.text },

  filtersContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    flexWrap: "wrap",
    position: 'relative',
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: ms(18),
    paddingVertical: ms(12),
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filterChipActive: { 
    backgroundColor: '#2D5A27', 
    borderColor: '#2D5A27',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  filterTextActive: { color: "#fff" },

  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: ms(18),
    paddingVertical: ms(12),
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  durationChipActive: { 
    backgroundColor: '#2D5A27', 
    borderColor: '#2D5A27',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  durationText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  durationTextActive: { color: "#fff" },

  dropdown: {
    position: 'absolute',
    top: ms(50),
    left: '50%',
    transform: [{ translateX: -ms(60) }],
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
    zIndex: 1000,
    minWidth: ms(120),
  },

  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  dropdownText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  cardWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },

  card: {
    width: '100%',
    height: CARD.h,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },

  cardImageContainer: {
    position: 'relative',
    height: ms(100),
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emojiContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emojiIcon: {
    fontSize: ms(56),
    textAlign: 'center',
  },

  durationBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  durationText: {
    ...type.caption,
    color: '#fff',
    fontWeight: '600',
    fontSize: ms(10),
  },

  cardContent: {
    flex: 1,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },

  cardTitle: { 
    ...type.body, 
    color: colors.text, 
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  
  cardSub: { 
    ...type.caption, 
    color: colors.mutedText,
    lineHeight: ms(16),
    marginBottom: spacing.md,
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingRight: spacing.sm,
    paddingLeft: spacing.sm,
    marginTop: 'auto',
  },

  typeBadge: {
    backgroundColor: '#2D5A27',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#1A4A1F',
    shadowColor: '#2D5A27',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeText: {
    ...type.caption,
    color: '#fff',
    fontWeight: '700',
    fontSize: ms(11),
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },

  emptyTitle: {
    ...type.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...type.body,
    color: colors.mutedText,
    textAlign: 'center',
  },
});
