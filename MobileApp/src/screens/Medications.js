import React, { useState } from "react";
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

const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=640&q=80",
  "https://images.unsplash.com/photo-1582719478250-0c48d955f74c?w=640&q=80",
  "https://images.unsplash.com/photo-1580433303260-5992d9d87c0f?w=640&q=80",
  "https://images.unsplash.com/photo-1595433707802-6b2626ef1c86?w=640&q=80",
  "https://images.unsplash.com/photo-1607619056574-7b1371d37c1a?w=640&q=80",
];

const INITIAL = [
  { id: "m1", name: "Zoloft", dosage: "100mg", taken: true,  img: PLACEHOLDERS[0] },
  { id: "m2", name: "Lexapro", dosage: "20mg",  taken: true,  img: PLACEHOLDERS[1] },
  { id: "m3", name: "Wellbutrin", dosage: "150mg", taken: false, img: PLACEHOLDERS[2] },
  { id: "m4", name: "Prozac", dosage: "40mg",   taken: true,  img: PLACEHOLDERS[3] },
  { id: "m5", name: "Cymbalta", dosage: "60mg",  taken: false, img: PLACEHOLDERS[4] },
];

export default function Medications({ navigation }) {
  const [items, setItems] = useState(INITIAL);

  const toggleTaken = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, taken: !it.taken } : it))
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.dose}>{item.dosage}</Text>

        <TouchableOpacity
          onPress={() => toggleTaken(item.id)}
          activeOpacity={0.9}
          style={[styles.pill, item.taken ? styles.pillOn : styles.pillOff]}
        >
          <Text style={[styles.pillText, item.taken && styles.pillTextOn]}>
            {item.taken ? "Taken  ✓" : "Not Taken  ✕"}
          </Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: item.img }} style={styles.thumb} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Medications</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddMedication")}
          hitSlop={10}
        >
          <Feather name="plus" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing["3xl"],
          paddingTop: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
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
  },
  name: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: 4 },
  dose: { ...type.caption, color: colors.accent, marginBottom: spacing.sm },

  pill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingVertical: ms(6),
    paddingHorizontal: ms(12),
  },
  pillOn: { backgroundColor: colors.primary },
  pillOff: { backgroundColor: "#E7DDF9" },
  pillText: { ...type.caption, color: colors.accent, fontWeight: "700" },
  pillTextOn: { color: "#fff" },

  thumb: {
    width: TH,
    height: TH,
    borderRadius: radii.lg,
    marginLeft: spacing.md,
  },
});
