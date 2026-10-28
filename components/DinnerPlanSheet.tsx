import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton, TextButton } from "@/components/account/Buttons";
import { Palette } from "@/constants/theme";
import { useDinnerPlan } from "@/hooks/useDinnerPlan";
import { DinnerPlan, PLAN_TIMES, PlanTime, WEEK_DAYS, describePlan } from "@/lib/dinnerPlan";

// Deux questions, puis le plan en une phrase que la personne valide
// elle-même : choisir son plan engage plus qu'un rappel imposé.
export default function DinnerPlanSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { plan, savePlan } = useDinnerPlan();

  const save = (next: DinnerPlan | null) => {
    savePlan(next);
    if (next && process.env.EXPO_OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.handle} />
          {/* Monté à chaque ouverture : le brouillon repart du plan enregistré. */}
          {visible && <PlanForm initial={plan} onSave={save} />}
        </View>
      </View>
    </Modal>
  );
}

function PlanForm({
  initial,
  onSave,
}: {
  initial: DinnerPlan | null;
  onSave: (plan: DinnerPlan | null) => void;
}) {
  const [days, setDays] = useState<number[]>(initial?.days ?? []);
  const [time, setTime] = useState<PlanTime | null>(initial?.time ?? null);
  const draft = days.length > 0 && time ? { days, time } : null;

  const toggleDay = (day: number) =>
    setDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );

  return (
    <>
      <Text style={styles.title}>Ton plan souper</Text>

      <Text style={styles.question}>Quels soirs veux-tu cuisiner ?</Text>
      <View style={styles.row}>
        {WEEK_DAYS.map((d) => (
          <Choice
            key={d.day}
            label={d.short}
            accessibilityLabel={d.name}
            selected={days.includes(d.day)}
            onPress={() => toggleDay(d.day)}
          />
        ))}
      </View>

      <Text style={styles.question}>À quelle heure veux-tu ta suggestion ?</Text>
      <View style={styles.row}>
        {PLAN_TIMES.map((t) => (
          <Choice
            key={t.value}
            label={t.label}
            selected={time === t.value}
            onPress={() => setTime(t.value)}
          />
        ))}
      </View>

      <View style={[styles.plan, draft && styles.planReady]}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={draft ? Palette.green : Palette.muted}
        />
        <Text style={[styles.planText, !draft && { color: Palette.muted }]}>
          {draft ? describePlan(draft) : "Choisis tes soirs et ton heure : ton plan s'écrit ici."}
        </Text>
      </View>

      <PrimaryButton
        label="C'est mon plan"
        disabled={!draft}
        onPress={() => draft && onSave(draft)}
      />
      {initial && (
        <TextButton
          label="Retirer mon plan"
          color={Palette.muted}
          onPress={() => onSave(null)}
          style={{ marginTop: 6 }}
        />
      )}
    </>
  );
}

function Choice({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceOn,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  question: { fontSize: 16, fontWeight: "700", color: Palette.text, marginTop: 20, marginBottom: 10 },
  row: { flexDirection: "row", gap: 6 },
  choice: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceOn: { borderColor: Palette.green, backgroundColor: Palette.greenSoft },
  choiceText: { fontSize: 14, fontWeight: "700", color: Palette.muted },
  choiceTextOn: { color: Palette.green },
  plan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 14,
    marginTop: 22,
    marginBottom: 16,
  },
  planReady: { borderColor: Palette.green },
  planText: { flex: 1, fontSize: 15, lineHeight: 21, fontWeight: "700", color: Palette.text },
});
