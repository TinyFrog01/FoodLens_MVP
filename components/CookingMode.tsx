import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette } from "@/constants/theme";
import { formatIngredient } from "@/lib/portions";

export type CookingIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  ingredients: CookingIngredient[];
  instructions: string[];
};

// The background tells you what a step asks of you: blue while something
// boils, warm while it bakes or fries, slate while you wait, the app's
// off-white otherwise. A label repeats it for anyone who can't tell colors apart.
const MOODS: Record<
  "prep" | "boil" | "heat" | "rest",
  {
    bg: string;
    accent: string;
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  prep: { bg: Palette.bg, accent: Palette.green, label: "Préparation", icon: "knife" },
  boil: { bg: "#EAF4FF", accent: "#2E86DE", label: "Ébullition", icon: "pot-steam-outline" },
  heat: { bg: "#FFF1E6", accent: "#E8622C", label: "Cuisson", icon: "fire" },
  rest: { bg: "#EEF2F4", accent: "#4F6D7A", label: "Attente", icon: "timer-sand" },
};

type Mood = keyof typeof MOODS;

// Matched on the step without accents or capitals ("Porter à ébullition",
// "Cuire au four", "Laisser reposer"): the recipes are written in French.
const MOOD_PATTERNS: { mood: Mood; pattern: RegExp }[] = [
  {
    mood: "boil",
    pattern:
      /\b(bouillir|bouillant\w*|ebullition|mijot\w*|fremi\w*|pocher|blanchir|boil\w*|simmer\w*|poach\w*|blanch\w*)\b/,
  },
  {
    mood: "heat",
    pattern:
      /\b(four|enfourn\w*|cuire|cuisson|roti\w*|frire|frit\w*|poele\w*|revenir|saute\w*|grill\w*|gril|saisi\w*|dorer|caramelis\w*|bake|oven|roast\w*|fry|fried|sear\w*)\b/,
  },
  {
    mood: "rest",
    pattern: /\b(reposer|refroidir|tiedir|lever|mariner|refriger\w*|congel\w*|rest|chill\w*|cool)\b/,
  },
];

function getStepMood(text: string): Mood {
  const plain = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return MOOD_PATTERNS.find((m) => m.pattern.test(plain))?.mood ?? "prep";
}

// Looks for a duration mentioned in a step ("30 minutes", "45 seconds") and
// returns it in seconds, or null if there's nothing to wait for.
function extractDurationSeconds(text: string): number | null {
  const match = text.match(/(\d+)\s*(minutes?|mins?|seconds?|secs?)\b/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  return unit.startsWith("s") ? value : value * 60;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Renders a step's text with every ingredient mention in bold; tapping a
// mention crosses it out, so you can tick off what you've already added
// without ever leaving the instructions.
function StepText({
  text,
  ingredientNames,
  checked,
  onToggle,
  accent,
}: {
  text: string;
  ingredientNames: string[];
  checked: Set<string>;
  onToggle: (name: string) => void;
  accent: string;
}) {
  const regex = useMemo(() => {
    if (ingredientNames.length === 0) return null;
    const escaped = ingredientNames
      .slice()
      .sort((a, b) => b.length - a.length)
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  }, [ingredientNames]);

  if (!regex) return <Text style={styles.stepBodyText}>{text}</Text>;

  const parts = text.split(regex);

  return (
    <Text style={styles.stepBodyText}>
      {parts.map((part, i) => {
        const match = ingredientNames.find(
          (n) => n.toLowerCase() === part.toLowerCase()
        );
        if (!match) return <Text key={i}>{part}</Text>;
        const key = match.toLowerCase();
        const isChecked = checked.has(key);
        return (
          <Text
            key={i}
            onPress={() => onToggle(key)}
            style={[
              styles.ingredientMention,
              !isChecked && { color: accent },
              isChecked && styles.ingredientMentionChecked,
            ]}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

// The timer for one step: ready but paused, and only started by a tap.
// Rebuilt for every step (see its key), so changing steps re-arms it.
function StepTimer({ duration, accent }: { duration: number; accent: string }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  // While running: when it reaches zero. Counting from a deadline keeps the
  // timer right even if the phone delays a tick.
  const [endsAt, setEndsAt] = useState<number | null>(null);

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setSecondsLeft(left);
      // Auto-pause once it hits zero so the pill switches to "time's up".
      if (left === 0) setEndsAt(null);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const running = endsAt !== null;

  const handlePress = () => {
    if (running) {
      setSecondsLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
      setEndsAt(null);
      return;
    }
    const start = secondsLeft === 0 ? duration : secondsLeft;
    setSecondsLeft(start);
    setEndsAt(Date.now() + start * 1000);
  };

  let label = `En pause · ${formatTime(secondsLeft)}`;
  let icon: keyof typeof Ionicons.glyphMap = "play";
  if (secondsLeft === 0) {
    label = "Temps écoulé · toucher pour relancer";
    icon = "refresh";
  } else if (running) {
    label = `Il reste ${formatTime(secondsLeft)}`;
    icon = "pause";
  } else if (secondsLeft === duration) {
    label = `Lancer le minuteur · ${formatTime(secondsLeft)}`;
  }

  return (
    <TouchableOpacity
      style={[styles.timerPill, { borderColor: accent }]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={16} color={secondsLeft === 0 ? accent : Palette.subtext} />
      <Text style={[styles.timerText, secondsLeft === 0 && { color: accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CookingMode({ visible, onClose, ...session }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Mounted on every opening: always a clean slate, from step 1. */}
      {visible && <CookingSession onClose={onClose} {...session} />}
    </Modal>
  );
}

function CookingSession({
  onClose,
  title,
  ingredients,
  instructions,
}: Omit<Props, "visible">) {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showIngredientList, setShowIngredientList] = useState(false);

  const ingredientNames = useMemo(() => ingredients.map((i) => i.name), [ingredients]);
  const isLastStep = stepIndex === instructions.length - 1;
  const stepText = instructions[stepIndex] ?? "";
  const mood = MOODS[getStepMood(stepText)];
  // null if the step never mentions a wait.
  const duration = extractDurationSeconds(stepText);

  const toggleIngredient = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const goPrevStep = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  };

  const goNextStep = () => {
    if (isLastStep) onClose();
    else setStepIndex((s) => s + 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: mood.bg, paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        {/* Always exits cooking mode and returns to the recipe screen. */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.headerButton}
          accessibilityLabel="Quitter le mode cuisine"
        >
          <Ionicons name="chevron-back" size={24} color={Palette.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity onPress={() => setShowIngredientList((v) => !v)} hitSlop={8}>
          <Text style={[styles.showListText, { color: mood.accent }]}>
            {showIngredientList ? "Masquer" : "Ingrédients"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressRow}>
        {instructions.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressSegment,
              idx <= stepIndex && { backgroundColor: mood.accent },
            ]}
          />
        ))}
      </View>

      {duration !== null && (
        <StepTimer key={stepIndex} duration={duration} accent={mood.accent} />
      )}

      {showIngredientList && (
        <View style={styles.ingredientListCard}>
          {ingredients.map((ingredient, idx) => {
            const key = ingredient.name.toLowerCase();
            const isChecked = checked.has(key);
            return (
              <TouchableOpacity
                key={`${idx}-${ingredient.name}`}
                style={styles.ingredientListRow}
                onPress={() => toggleIngredient(key)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && {
                      backgroundColor: mood.accent,
                      borderColor: mood.accent,
                    },
                  ]}
                >
                  {isChecked && <Ionicons name="checkmark" size={12} color="#FFF" />}
                </View>
                <Text
                  style={[
                    styles.ingredientListText,
                    isChecked && styles.ingredientListTextChecked,
                  ]}
                >
                  {formatIngredient(ingredient)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.stepLabel}>
          Étape {stepIndex + 1} sur {instructions.length}
        </Text>
        <View style={[styles.moodChip, { borderColor: mood.accent }]}>
          <MaterialCommunityIcons name={mood.icon} size={15} color={mood.accent} />
          <Text style={[styles.moodText, { color: mood.accent }]}>{mood.label}</Text>
        </View>

        <StepText
          text={stepText}
          ingredientNames={ingredientNames}
          checked={checked}
          onToggle={toggleIngredient}
          accent={mood.accent}
        />
      </ScrollView>

      {/* One main action, big and under the thumb: the next step. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={goPrevStep}
          disabled={stepIndex === 0}
          accessibilityLabel="Étape précédente"
          style={[styles.prevButton, stepIndex === 0 && styles.prevButtonDisabled]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={stepIndex === 0 ? Palette.muted : Palette.text}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={goNextStep} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>
            {isLastStep ? "Terminer" : "Étape suivante"}
          </Text>
          {!isLastStep && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "700", color: Palette.text },
  showListText: { fontSize: 14, fontWeight: "700", paddingHorizontal: 8 },

  progressRow: { flexDirection: "row", gap: 6, paddingHorizontal: 22, marginTop: 12 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Palette.border },

  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    marginTop: 16,
    backgroundColor: Palette.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  timerText: { fontSize: 13, fontWeight: "700", color: Palette.subtext },

  ingredientListCard: {
    backgroundColor: Palette.card,
    borderRadius: 18,
    marginHorizontal: 22,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  ingredientListRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Palette.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ingredientListText: { fontSize: 15, color: Palette.text, flexShrink: 1 },
  ingredientListTextChecked: { color: Palette.subtext, textDecorationLine: "line-through" },

  body: { flex: 1, paddingHorizontal: 22, marginTop: 20 },
  stepLabel: { fontSize: 26, fontWeight: "800", color: Palette.text },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  moodText: { fontSize: 12.5, fontWeight: "800" },
  stepBodyText: { fontSize: 18, lineHeight: 28, color: Palette.text },
  ingredientMention: { fontWeight: "800" },
  ingredientMentionChecked: { color: Palette.subtext, textDecorationLine: "line-through" },

  footer: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 10 },
  prevButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    justifyContent: "center",
    alignItems: "center",
  },
  prevButtonDisabled: { opacity: 0.4 },
  nextButton: {
    flex: 1,
    height: 64,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 32,
    backgroundColor: Palette.ink,
  },
  nextButtonText: { color: "#FFF", fontSize: 18, fontWeight: "800" },
});
