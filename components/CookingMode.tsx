import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const COLORS = {
  bg: "#F7F7F5",
  card: "#FFFFFF",
  border: "#EEEEEE",
  text: "#111111",
  subtext: "#6B6B6B",
  green: "#18A64B",
  greenSoft: "#DFF7DF",
};

// Background/accent shifts depending on what a step is asking you to do — a
// light blue wash for anything boiling/simmering, a warm wash for anything
// baking/frying/grilling, and the app's default green otherwise.
const MOODS = {
  neutral: { bg: "#F7F7F5", accent: COLORS.green, accentSoft: COLORS.greenSoft },
  boil: { bg: "#EAF4FF", accent: "#2E86DE", accentSoft: "#DCEBFF" },
  heat: { bg: "#FFF1E6", accent: "#E8622C", accentSoft: "#FFE1CC" },
} as const;

const MOOD_KEYWORDS: { mood: keyof typeof MOODS; words: string[] }[] = [
  { mood: "boil", words: ["boil", "simmer", "poach", "blanch"] },
  {
    mood: "heat",
    words: ["bake", "oven", "roast", "fry", "sauté", "saute", "grill", "sear"],
  },
];

function getStepMood(text: string): keyof typeof MOODS {
  const lower = text.toLowerCase();
  for (const group of MOOD_KEYWORDS) {
    if (group.words.some((w) => lower.includes(w))) return group.mood;
  }
  return "neutral";
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

function formatQuantity(value: number) {
  return `${Math.round(value * 100) / 100}`;
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

export default function CookingMode({
  visible,
  onClose,
  title,
  ingredients,
  instructions,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showIngredientList, setShowIngredientList] = useState(false);
  const [viewMode, setViewMode] = useState<"written" | "video">("written");

  // Timer: `duration` is the fixed length for the current step (null if the
  // step never mentions a wait). `secondsLeft` is the live countdown value.
  // `timerRunning` only becomes true when the user taps the timer pill —
  // changing steps never starts it automatically.
  const [duration, setDuration] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const ingredientNames = useMemo(() => ingredients.map((i) => i.name), [ingredients]);
  const isLastStep = stepIndex === instructions.length - 1;
  const stepText = instructions[stepIndex] ?? "";
  const mood = MOODS[getStepMood(stepText)];

  // Reset to a clean slate every time the sheet is opened.
  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      setChecked(new Set());
      setShowIngredientList(false);
      setViewMode("written");
    }
  }, [visible]);

  // Re-arm the timer (paused, not counting down) whenever the step changes.
  useEffect(() => {
    if (!visible) {
      setDuration(null);
      setSecondsLeft(null);
      setTimerRunning(false);
      return;
    }
    const d = extractDurationSeconds(stepText);
    setDuration(d);
    setSecondsLeft(d);
    setTimerRunning(false);
  }, [visible, stepIndex, stepText]);

  // Only ticks while timerRunning is true.
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, stepIndex]);

  // Auto-pause once it hits zero so the pill switches to "time's up".
  useEffect(() => {
    if (timerRunning && secondsLeft === 0) {
      setTimerRunning(false);
    }
  }, [secondsLeft, timerRunning]);

  const handleTimerPress = () => {
    if (secondsLeft === null) return;
    if (secondsLeft === 0) {
      setSecondsLeft(duration);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((r) => !r);
  };

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

  let timerLabel = "";
  let timerIcon: keyof typeof Ionicons.glyphMap = "play";
  if (secondsLeft === 0) {
    timerLabel = "Time's up — tap to restart";
    timerIcon = "refresh";
  } else if (timerRunning) {
    timerLabel = `${formatTime(secondsLeft ?? 0)} remaining`;
    timerIcon = "pause";
  } else if (secondsLeft === duration) {
    timerLabel = `Tap to start · ${formatTime(secondsLeft ?? 0)}`;
    timerIcon = "play";
  } else {
    timerLabel = `Paused · ${formatTime(secondsLeft ?? 0)}`;
    timerIcon = "play";
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: mood.bg }]}>
        <View style={styles.header}>
          {/* Always exits cooking mode and returns to the recipe screen. */}
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity onPress={() => setShowIngredientList((v) => !v)}>
            <Text style={[styles.showListText, { color: mood.accent }]}>
              {showIngredientList ? "Hide list" : "Show list"}
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
          <TouchableOpacity
            style={[styles.timerPill, { borderColor: mood.accent }]}
            onPress={handleTimerPress}
            activeOpacity={0.75}
          >
            <Ionicons
              name={timerIcon}
              size={16}
              color={secondsLeft === 0 ? mood.accent : COLORS.subtext}
            />
            <Text
              style={[styles.timerText, secondsLeft === 0 && { color: mood.accent }]}
            >
              {timerLabel}
            </Text>
          </TouchableOpacity>
        )}

        {showIngredientList && (
          <View style={styles.ingredientListCard}>
            {ingredients.map((ingredient) => {
              const key = ingredient.name.toLowerCase();
              const isChecked = checked.has(key);
              return (
                <TouchableOpacity
                  key={ingredient.name}
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
                    {formatQuantity(ingredient.quantity)}
                    {ingredient.unit} {ingredient.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.stepLabel}>Step {stepIndex + 1}</Text>

          {viewMode === "written" ? (
            <StepText
              text={stepText}
              ingredientNames={ingredientNames}
              checked={checked}
              onToggle={toggleIngredient}
              accent={mood.accent}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam-outline" size={28} color={COLORS.subtext} />
              <Text style={styles.videoPlaceholderText}>
                No video for this step yet — switch back to the written view.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.stepNavRow}>
            <TouchableOpacity
              onPress={goPrevStep}
              disabled={stepIndex === 0}
              style={[
                styles.prevCircleButton,
                stepIndex === 0 && styles.prevCircleButtonDisabled,
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={stepIndex === 0 ? COLORS.subtext : COLORS.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: COLORS.text }]}
              onPress={goNextStep}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? "finish cooking" : "next step"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewToggleRow}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "video" && {
                  backgroundColor: COLORS.text,
                  borderColor: COLORS.text,
                },
              ]}
              onPress={() => setViewMode("video")}
            >
              <Ionicons
                name="play"
                size={14}
                color={viewMode === "video" ? "#FFF" : COLORS.text}
              />
              <Text
                style={[styles.viewToggleText, viewMode === "video" && { color: "#FFF" }]}
              >
                Switch to video
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "written" && {
                  backgroundColor: COLORS.text,
                  borderColor: COLORS.text,
                },
              ]}
              onPress={() => setViewMode("written")}
            >
              <Ionicons
                name="list"
                size={14}
                color={viewMode === "written" ? "#FFF" : COLORS.text}
              />
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "written" && { color: "#FFF" },
                ]}
              >
                Switch to written view
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "700", color: COLORS.text },
  showListText: { fontSize: 13, fontWeight: "700" },

  progressRow: { flexDirection: "row", gap: 6, paddingHorizontal: 22, marginTop: 12 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },

  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  timerText: { fontSize: 13, fontWeight: "700", color: COLORS.subtext },

  ingredientListCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: 22,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientListRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ingredientListText: { fontSize: 15, color: COLORS.text, flexShrink: 1 },
  ingredientListTextChecked: { color: COLORS.subtext, textDecorationLine: "line-through" },

  body: { flex: 1, paddingHorizontal: 22, marginTop: 20 },
  stepLabel: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginBottom: 14 },
  stepBodyText: { fontSize: 17, lineHeight: 27, color: COLORS.text },
  ingredientMention: { fontWeight: "800" },
  ingredientMentionChecked: { color: COLORS.subtext, textDecorationLine: "line-through" },

  videoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 40,
    gap: 10,
  },
  videoPlaceholderText: { fontSize: 14, color: COLORS.subtext, textAlign: "center", paddingHorizontal: 24 },

  footer: { paddingHorizontal: 22, paddingBottom: 28, paddingTop: 10, gap: 12 },

  stepNavRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  prevCircleButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  prevCircleButtonDisabled: { opacity: 0.4 },

  nextButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 14,
  },
  nextButtonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },

  viewToggleRow: { flexDirection: "row", gap: 10 },
  viewToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
  },
  viewToggleText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
});