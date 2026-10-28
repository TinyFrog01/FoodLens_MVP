import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/components/account/Avatar";
import { PrimaryButton, TextButton } from "@/components/account/Buttons";
import ChoiceChip from "@/components/account/ChoiceChip";
import TagInput from "@/components/account/TagInput";
import TopBar, { useGoBack } from "@/components/account/TopBar";
import {
  ALLERGENS,
  AVOID_SUGGESTIONS,
  DIETS,
  FOOD_SUGGESTIONS,
  MEMBER_COLORS,
} from "@/constants/dietary";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { createMember } from "@/lib/account/storage";
import { Account, Member, SELF_ID } from "@/lib/account/types";
import { confirmAction } from "@/lib/confirm";

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Une suggestion déjà dans l'autre liste (aime / n'aime pas) n'est pas reproposée.
const without = (suggestions: string[], taken: string[]) =>
  suggestions.filter((s) => !taken.some((t) => t.toLowerCase() === s.toLowerCase()));

// Fiche d'une personne (soi-même ou un membre) : régime, allergies, goûts.
// ?id=self | ?id=<membre> | ?id=new
export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { account } = useAccount();
  const goBack = useGoBack();

  if (!account) return null;

  const isNew = !id || id === "new";
  const existing = isNew
    ? undefined
    : id === SELF_ID
      ? account.self
      : account.members.find((m) => m.id === id);

  if (!isNew && !existing) {
    return (
      <View style={styles.page}>
        <TopBar />
        <View style={styles.missing}>
          <Text style={TextStyles.sectionTitle}>Ce membre n&apos;existe plus.</Text>
          <TextButton label="Retour" onPress={goBack} />
        </View>
      </View>
    );
  }

  return <MemberEditor account={account} initial={existing} />;
}

function MemberEditor({ account, initial }: { account: Account; initial?: Member }) {
  const insets = useSafeAreaInsets();
  const goBack = useGoBack();
  const { saveMember, removeMember } = useAccount();

  const isSelf = initial?.id === SELF_ID;
  const [draft, setDraft] = useState<Member>(
    () =>
      initial ??
      createMember({
        name: "",
        color: MEMBER_COLORS[(account.members.length + 1) % MEMBER_COLORS.length],
      })
  );
  const [nameError, setNameError] = useState(false);

  const update = (patch: Partial<Member>) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setNameError(true);
      return;
    }
    saveMember({ ...draft, name });
    goBack();
  };

  const confirmRemove = () =>
    confirmAction({
      title: `Retirer ${draft.name || "ce membre"} ?`,
      message: "Ses préférences seront supprimées.",
      confirmLabel: "Retirer",
      destructive: true,
      onConfirm: () => {
        removeMember(draft.id);
        goBack();
      },
    });

  const title = isSelf ? "Ton profil alimentaire" : initial ? "Modifier le membre" : "Nouveau membre";

  return (
    <View style={styles.page}>
      <TopBar title={title} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identité */}
          <View style={styles.identity}>
            <Avatar name={draft.name || "?"} color={draft.color} size={72} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                value={draft.name}
                onChangeText={(name) => {
                  update({ name });
                  if (nameError) setNameError(false);
                }}
                placeholder={isSelf ? "Ton prénom" : "Ex. Léa"}
                placeholderTextColor="#A6A6A0"
                autoCapitalize="words"
                autoFocus={!initial}
                style={[styles.nameInput, nameError && { borderColor: Palette.danger }]}
              />
              {nameError ? <Text style={styles.error}>Entre un prénom.</Text> : null}
            </View>
          </View>

          <View style={styles.colors}>
            {MEMBER_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => update({ color })}
                accessibilityLabel="Couleur de l'avatar"
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  draft.color === color && styles.swatchOn,
                ]}
              />
            ))}
          </View>

          {/* Régime */}
          <Section title="Régime alimentaire" hint="Seules les recettes compatibles sont proposées.">
            <View style={styles.chips}>
              {DIETS.map((d) => (
                <ChoiceChip
                  key={d.key}
                  label={d.label}
                  selected={draft.diets.includes(d.key)}
                  onPress={() => update({ diets: toggle(draft.diets, d.key) })}
                />
              ))}
            </View>
          </Section>

          {/* Allergies */}
          <Section
            title="Allergies et intolérances"
            hint="Les recettes qui en contiennent sont masquées."
          >
            <View style={styles.chips}>
              {ALLERGENS.map((a) => (
                <ChoiceChip
                  key={a.key}
                  label={a.label}
                  tone="danger"
                  selected={draft.allergens.includes(a.key)}
                  onPress={() => update({ allergens: toggle(draft.allergens, a.key) })}
                />
              ))}
            </View>
            <Text style={[styles.subLabel, { marginTop: 8 }]}>Autres aliments à éviter</Text>
            <TagInput
              values={draft.avoid}
              onChange={(avoid) => update({ avoid })}
              placeholder="Ex. kiwi"
              suggestions={AVOID_SUGGESTIONS}
              tone="danger"
            />
          </Section>

          {/* Goûts */}
          <Section title="Aime" hint="Les recettes qui en contiennent passent en premier.">
            <TagInput
              values={draft.likes}
              onChange={(likes) => update({ likes })}
              placeholder="Ex. banane, chocolat…"
              suggestions={without(FOOD_SUGGESTIONS, draft.dislikes)}
              tone="green"
            />
          </Section>

          <Section
            title="N'aime pas"
            hint="Les recettes qui en contiennent passent après les autres et sont signalées, pour que tu puisses remplacer l'ingrédient."
          >
            <TagInput
              values={draft.dislikes}
              onChange={(dislikes) => update({ dislikes })}
              placeholder="Ex. oignon, champignons…"
              suggestions={without(FOOD_SUGGESTIONS, draft.likes)}
              tone="warn"
            />
          </Section>

          {initial && !isSelf && (
            <TextButton
              label="Retirer ce membre"
              color={Palette.danger}
              onPress={confirmRemove}
              style={{ marginTop: 6 }}
            />
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <PrimaryButton label="Enregistrer" onPress={save} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={TextStyles.sectionTitle}>{title}</Text>
      <Text style={[TextStyles.sectionHint, { marginTop: 3, marginBottom: 12 }]}>{hint}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
  identity: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "700", color: Palette.text, marginBottom: 7 },
  subLabel: { fontSize: 13, fontWeight: "700", color: Palette.text, marginBottom: 8 },
  nameInput: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: "600",
    color: Palette.text,
  },
  error: { color: Palette.danger, fontSize: 13, marginTop: 5, fontWeight: "600" },
  colors: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16, marginBottom: 6 },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  swatchOn: { borderWidth: 3, borderColor: "#FFFFFF", ...CardShadow, shadowOpacity: 0.25 },
  section: {
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    ...CardShadow,
  },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    backgroundColor: Palette.bg,
  },
});
