import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/components/account/Avatar";
import { PrimaryButton, SecondaryButton, TextButton } from "@/components/account/Buttons";
import ChoiceChip from "@/components/account/ChoiceChip";
import OptionTile from "@/components/account/OptionTile";
import TagInput from "@/components/account/TagInput";
import {
  ALLERGENS,
  APPLIANCES,
  AVOID_SUGGESTIONS,
  DIETS,
} from "@/constants/dietary";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { describeMember } from "@/lib/account/recipeFilter";

const { width } = Dimensions.get("window");
const TILE_WIDTH = (width - 40 - 12) / 2;

const STEPS = [
  {
    title: "Tes appareils",
    subtitle: "On te proposera seulement des recettes réalisables dans ta cuisine.",
  },
  {
    title: "Ton régime",
    subtitle: "Les recettes qui ne conviennent pas sont retirées. Aucun choix = tout est proposé.",
  },
  {
    title: "Allergies et intolérances",
    subtitle: "Les recettes qui contiennent ces aliments n'apparaîtront plus du tout.",
  },
  {
    title: "Pour qui cuisines-tu ?",
    subtitle: "Ajoute les membres de ta famille, leurs goûts et ce qu'ils n'aiment pas.",
  },
];

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Configuration juste après la création du compte. Chaque choix est
// enregistré immédiatement ; « Terminer » ouvre l'app.
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, updateAccount, saveMember, completeOnboarding } = useAccount();
  const [step, setStep] = useState(0);

  if (!account) return null;
  const self = account.self;
  const isLast = step === STEPS.length - 1;
  const next = () => (isLast ? completeOnboarding() : setStep(step + 1));

  return (
    <View style={styles.page}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.segment, i <= step && styles.segmentOn]} />
          ))}
        </View>
        <TextButton label={isLast ? "Plus tard" : "Passer"} color={Palette.muted} onPress={next} />
      </View>

      <ScrollView
        key={step}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={TextStyles.eyebrow}>
          ÉTAPE {step + 1} SUR {STEPS.length}
        </Text>
        <Text style={styles.title}>
          {step === 0 ? `Bonjour ${self.name} !\n` : ""}
          {STEPS[step].title}
        </Text>
        <Text style={TextStyles.pageSubtitle}>{STEPS[step].subtitle}</Text>

        {step === 0 && (
          <View style={styles.grid}>
            {APPLIANCES.map((a) => (
              <OptionTile
                key={a.key}
                label={a.label}
                icon={a.icon}
                selected={account.appliances.includes(a.key)}
                onPress={() =>
                  updateAccount((acc) => ({ ...acc, appliances: toggle(acc.appliances, a.key) }))
                }
                style={{ width: TILE_WIDTH }}
              />
            ))}
          </View>
        )}

        {step === 1 && (
          <View style={styles.grid}>
            {DIETS.map((d) => (
              <OptionTile
                key={d.key}
                label={d.label}
                description={d.description}
                icon={d.icon}
                selected={self.diets.includes(d.key)}
                onPress={() => saveMember({ ...self, diets: toggle(self.diets, d.key) })}
                style={{ width: TILE_WIDTH }}
              />
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={TextStyles.sectionTitle}>Allergènes</Text>
            <View style={styles.chips}>
              {ALLERGENS.map((a) => (
                <ChoiceChip
                  key={a.key}
                  label={a.label}
                  tone="danger"
                  selected={self.allergens.includes(a.key)}
                  onPress={() => saveMember({ ...self, allergens: toggle(self.allergens, a.key) })}
                />
              ))}
            </View>

            <Text style={[TextStyles.sectionTitle, { marginTop: 18 }]}>Autres aliments à éviter</Text>
            <Text style={[TextStyles.sectionHint, { marginBottom: 10 }]}>
              Une intolérance qui n&apos;est pas dans la liste ? Ajoute-la ici.
            </Text>
            <TagInput
              values={self.avoid}
              onChange={(avoid) => saveMember({ ...self, avoid })}
              placeholder="Ex. kiwi, fraise…"
              suggestions={AVOID_SUGGESTIONS}
              tone="danger"
            />
          </View>
        )}

        {step === 3 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.card}>
              {[self, ...account.members].map((m, i) => (
                <Pressable
                  key={m.id}
                  onPress={() => router.push({ pathname: "/member", params: { id: m.id } })}
                  style={[styles.memberRow, i > 0 && styles.memberRowBorder]}
                >
                  <Avatar name={m.name} color={m.color} size={42} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.memberName}>
                      {m.name}
                      {m.id === self.id ? <Text style={styles.me}>  Moi</Text> : null}
                    </Text>
                    <Text style={styles.memberSummary} numberOfLines={1}>
                      {describeMember(m)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C7C7BF" />
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => router.push({ pathname: "/member", params: { id: "new" } })}
              style={({ pressed }) => [styles.addMember, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="add" size={22} color={Palette.green} />
              <Text style={styles.addMemberText}>Ajouter un membre de la famille</Text>
            </Pressable>

            <Text style={[TextStyles.sectionHint, { marginTop: 14 }]}>
              Touche une personne pour indiquer ce qu&apos;elle aime ou n&apos;aime pas. À
              chaque repas, tu pourras choisir pour qui tu cuisines.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {step > 0 && (
          <SecondaryButton label="Retour" onPress={() => setStep(step - 1)} style={{ flex: 1 }} />
        )}
        <PrimaryButton
          label={isLast ? "C'est parti !" : "Continuer"}
          onPress={next}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  progress: { flex: 1, flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#E4E4DE" },
  segmentOn: { backgroundColor: Palette.green },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30 },
  title: { fontSize: 30, fontWeight: "800", color: Palette.text, lineHeight: 36 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 20,
  },
  card: {
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    ...CardShadow,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  memberRowBorder: { borderTopWidth: 1, borderTopColor: "#F0F0EE" },
  memberName: { fontSize: 16, fontWeight: "700", color: Palette.text },
  me: { fontSize: 12, fontWeight: "700", color: Palette.green },
  memberSummary: { fontSize: 13, color: Palette.muted, marginTop: 2 },
  addMember: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    height: 54,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D6D6D6",
    backgroundColor: "#FCFCFC",
  },
  addMemberText: { color: Palette.green, fontWeight: "700", fontSize: 15 },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    backgroundColor: Palette.bg,
  },
});
