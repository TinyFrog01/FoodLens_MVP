import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import {
  describeMember,
  getAllMembers,
  getCookingFor,
  isSelf,
} from "@/lib/account/recipeFilter";

import Avatar from "./Avatar";
import { PrimaryButton } from "./Buttons";

export function cookingForLabel(names: { name: string; self: boolean }[]) {
  if (names.length === 1) return names[0].self ? "Pour moi" : `Pour ${names[0].name}`;
  return `Pour ${names.length} personnes`;
}

// Pilule « Pour 3 personnes ▾ » posée sur les photos du fil de recettes.
export function CookingForPill({ onPress }: { onPress: () => void }) {
  const router = useRouter();
  const { account } = useAccount();

  if (!account) {
    return (
      <Pressable
        onPress={() => router.push("/profile")}
        style={({ pressed }) => [styles.pill, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="person-outline" size={15} color="#FFFFFF" />
        <Text style={styles.pillText}>Mode invité · Créer un compte</Text>
      </Pressable>
    );
  }

  const people = getCookingFor(account);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Choisir pour qui je cuisine"
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.stack}>
        {people.slice(0, 3).map((p, i) => (
          <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
            <Avatar name={p.name} color={p.color} size={24} bordered />
          </View>
        ))}
      </View>
      <Text style={styles.pillText}>
        {cookingForLabel(people.map((p) => ({ name: p.name, self: isSelf(p) })))}
      </Text>
      <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
    </Pressable>
  );
}

// Feuille « Je cuisine pour » : chaque changement s'applique tout de suite.
export function CookingForSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, setCookingFor } = useAccount();

  if (!account) return null;

  const everyone = getAllMembers(account);
  const selected = getCookingFor(account).map((m) => m.id);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) setCookingFor(selected.filter((x) => x !== id));
    } else {
      setCookingFor([...selected, id]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Je cuisine pour</Text>
          <Text style={styles.subtitle}>
            Les recettes s&apos;adaptent aux régimes, aux allergies et aux goûts de
            chaque personne choisie.
          </Text>

          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {everyone.map((member) => {
              const on = selected.includes(member.id);
              return (
                <Pressable
                  key={member.id}
                  onPress={() => toggle(member.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={[styles.row, on && styles.rowOn]}
                >
                  <Avatar name={member.name} color={member.color} size={44} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>
                      {member.name}
                      {isSelf(member) ? <Text style={styles.me}>  Moi</Text> : null}
                    </Text>
                    <Text style={styles.rowSummary} numberOfLines={1}>
                      {describeMember(member)}
                    </Text>
                  </View>
                  <View style={[styles.check, on && styles.checkOn]}>
                    {on && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.count}>
            {selected.length} personne{selected.length > 1 ? "s" : ""} · portions
            ajustables en un geste sur chaque recette
          </Text>

          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                onClose();
                router.push("/profile");
              }}
              hitSlop={8}
              style={styles.manage}
            >
              <Ionicons name="people-outline" size={18} color={Palette.green} />
              <Text style={styles.manageText}>Gérer la famille</Text>
            </Pressable>
            <PrimaryButton label="Terminé" onPress={onClose} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 22,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  stack: { flexDirection: "row" },
  pillText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },

  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: Palette.bg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D6D6D0",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800", color: Palette.text },
  subtitle: { fontSize: 14, color: Palette.muted, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.card,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Palette.border,
  },
  rowOn: { borderColor: Palette.green },
  rowText: { flex: 1, marginLeft: 12 },
  rowName: { fontSize: 16, fontWeight: "700", color: Palette.text },
  me: { fontSize: 12, fontWeight: "700", color: Palette.green },
  rowSummary: { fontSize: 13, color: Palette.muted, marginTop: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#C7C7BF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: Palette.green, borderColor: Palette.green },
  count: { fontSize: 13, color: Palette.muted, textAlign: "center", marginVertical: 10 },
  footer: { flexDirection: "row", alignItems: "center", gap: 16 },
  manage: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  manageText: { color: Palette.green, fontWeight: "700", fontSize: 15 },
});
