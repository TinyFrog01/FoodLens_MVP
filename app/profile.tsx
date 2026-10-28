import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/components/account/Avatar";
import { PrimaryButton, SecondaryButton, TextButton } from "@/components/account/Buttons";
import TopBar from "@/components/account/TopBar";
import { MAX_TIME_OPTIONS } from "@/constants/dietary";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useRecipeFeed } from "@/hooks/useRecipeFeed";
import { describeMember, getAllMembers, isSelf } from "@/lib/account/recipeFilter";
import { Account } from "@/lib/account/types";
import { confirmAction } from "@/lib/confirm";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function Profile() {
  const { account } = useAccount();
  return account ? <AccountProfile account={account} /> : <GuestProfile />;
}

// ─────────────────────────────────────────────
// Invité : ce qu'un compte apporte
// ─────────────────────────────────────────────
const PERKS: { icon: IconName; text: string }[] = [
  { icon: "leaf", text: "Filtrer les recettes selon ton régime" },
  { icon: "shield-check-outline", text: "Masquer celles qui contiennent tes allergènes" },
  { icon: "stove", text: "Ne voir que ce que tes appareils permettent" },
  { icon: "account-group-outline", text: "Ajouter ta famille, ses goûts et ce qu'elle n'aime pas" },
  { icon: "account-heart", text: "Choisir pour qui tu cuisines, avec des portions réglées d'office" },
  { icon: "heart-outline", text: "Tes favoris, tes notes et ta version des recettes" },
];

function GuestProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logOut } = useAccount();

  return (
    <View style={styles.page}>
      <TopBar />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <Text style={TextStyles.eyebrow}>TON COMPTE</Text>
        <Text style={TextStyles.pageTitle}>Mode invité</Text>
        <Text style={TextStyles.pageSubtitle}>
          Tu vois toutes les recettes, sans personnalisation.
        </Text>

        <View style={styles.perksCard}>
          <Text style={styles.perksTitle}>Avec un compte gratuit :</Text>
          {PERKS.map((p) => (
            <View key={p.text} style={styles.perk}>
              <View style={styles.perkIcon}>
                <MaterialCommunityIcons name={p.icon} size={18} color={Palette.green} />
              </View>
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: 10, marginTop: 22 }}>
          <PrimaryButton
            label="Créer mon compte"
            onPress={() => router.push({ pathname: "/auth", params: { mode: "signup" } })}
          />
          <SecondaryButton
            label="Se connecter"
            onPress={() => router.push({ pathname: "/auth", params: { mode: "login" } })}
          />
          <TextButton label="Revenir à l'écran d'accueil" color={Palette.muted} onPress={logOut} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// Compte
// ─────────────────────────────────────────────
function AccountProfile({ account }: { account: Account }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setCookingFor, updateAccount, logOut, deleteAccount } = useAccount();
  const { hidden } = useRecipeFeed();

  const everyone = getAllMembers(account);
  const selected = account.cookingFor;
  const customCount = Object.keys(account.customizations).length;

  const toggleCookingFor = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) setCookingFor(selected.filter((x) => x !== id));
    } else {
      setCookingFor([...selected, id]);
    }
  };

  const openMember = (id: string) => router.push({ pathname: "/member", params: { id } });
  const openRecipes = (tab: string) => router.push({ pathname: "/my-recipes", params: { tab } });

  const confirmDelete = () =>
    confirmAction({
      title: "Supprimer le compte ?",
      message: "Ton profil, ta famille, tes favoris et tes notes seront effacés de cet appareil.",
      confirmLabel: "Supprimer",
      destructive: true,
      onConfirm: deleteAccount,
    });

  const createdAt = new Date(account.createdAt).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.page}>
      <TopBar />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Avatar name={account.self.name} color={account.self.color} size={64} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name} numberOfLines={1}>
              {account.self.name}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {account.email}
            </Text>
          </View>
          <Pressable onPress={() => openMember(account.self.id)} style={styles.editPill}>
            <Ionicons name="pencil" size={14} color={Palette.text} />
            <Text style={styles.editPillText}>Modifier</Text>
          </Pressable>
        </View>

        {/* Je cuisine pour */}
        <Text style={styles.sectionLabel}>Je cuisine pour</Text>
        <View style={styles.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {everyone.map((m) => {
              const on = selected.includes(m.id);
              return (
                <Pressable
                  key={m.id}
                  onPress={() => toggleCookingFor(m.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={styles.person}
                >
                  <View style={[styles.personRing, on && styles.personRingOn]}>
                    <Avatar name={m.name} color={m.color} size={50} />
                    {on && (
                      <View style={styles.personCheck}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.personName, !on && { color: Palette.muted }]} numberOfLines={1}>
                    {isSelf(m) ? "Moi" : m.name}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable onPress={() => openMember("new")} style={styles.person}>
              <View style={styles.personAdd}>
                <Ionicons name="add" size={24} color={Palette.green} />
              </View>
              <Text style={[styles.personName, { color: Palette.green }]}>Ajouter</Text>
            </Pressable>
          </ScrollView>
          <Text style={[TextStyles.sectionHint, { marginTop: 10 }]}>
            {selected.length} personne{selected.length > 1 ? "s" : ""} · les recettes
            s&apos;adaptent aux régimes, aux allergies et aux goûts de chacun.
          </Text>
        </View>

        {/* Famille */}
        <Text style={styles.sectionLabel}>Ta famille</Text>
        <View style={styles.listCard}>
          {account.members.map((m) => (
            <Pressable key={m.id} onPress={() => openMember(m.id)} style={styles.row}>
              <Avatar name={m.name} color={m.color} size={40} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{m.name}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {describeMember(m)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7BF" />
            </Pressable>
          ))}
          <Pressable onPress={() => openMember("new")} style={styles.row}>
            <View style={styles.rowIconAdd}>
              <Ionicons name="add" size={20} color={Palette.green} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: Palette.green }]}>Ajouter un membre</Text>
              <Text style={styles.rowValue}>Ses goûts, ce qu&apos;il n&apos;aime pas, ses allergies</Text>
            </View>
          </Pressable>
        </View>

        {/* Préférences */}
        <Text style={styles.sectionLabel}>Tes préférences</Text>
        <View style={styles.listCard}>
          <Row
            icon="food-apple-outline"
            label="Ton profil alimentaire"
            value={describeMember(account.self)}
            onPress={() => openMember(account.self.id)}
          />
          <Row
            icon="stove"
            label="Appareils de cuisine"
            value={`${account.appliances.length} appareil${account.appliances.length > 1 ? "s" : ""}`}
            onPress={() => router.push("/appliances")}
          />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <MaterialCommunityIcons name="timer-outline" size={20} color={Palette.green} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Temps de préparation max</Text>
              <View style={styles.timeChips}>
                {MAX_TIME_OPTIONS.map((o) => {
                  const on = account.maxMinutes === o.value;
                  return (
                    <Pressable
                      key={o.label}
                      onPress={() => updateAccount((a) => ({ ...a, maxMinutes: o.value }))}
                      style={[styles.timeChip, on && styles.timeChipOn]}
                    >
                      <Text style={[styles.timeChipText, on && styles.timeChipTextOn]}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Recettes */}
        <Text style={styles.sectionLabel}>Tes recettes</Text>
        <View style={styles.listCard}>
          <Row
            icon="heart-outline"
            label="Tes favoris"
            value={`${account.favorites.length} recette${account.favorites.length > 1 ? "s" : ""}`}
            onPress={() => openRecipes("favorites")}
          />
          <Row
            icon="pencil-outline"
            label="Tes versions"
            value={`${customCount} recette${customCount > 1 ? "s" : ""} avec tes notes ou tes changements`}
            onPress={() => openRecipes("custom")}
          />
          <Row
            icon="eye-off-outline"
            label="Recettes masquées"
            value={`${hidden.length} selon tes filtres actuels`}
            onPress={() => openRecipes("hidden")}
          />
        </View>

        {/* Compte */}
        <Text style={styles.sectionLabel}>Compte</Text>
        <View style={styles.listCard}>
          <Row icon="logout" label="Se déconnecter" onPress={logOut} chevron={false} />
          <Row
            icon="delete-outline"
            label="Supprimer le compte"
            onPress={confirmDelete}
            danger
            chevron={false}
          />
        </View>

        <Text style={styles.footnote}>
          Compte créé le {createdAt} · enregistré sur cet appareil
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger = false,
  chevron = true,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  chevron?: boolean;
}) {
  const color = danger ? Palette.danger : Palette.green;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#FAFAF8" }]}
    >
      <View style={[styles.rowIcon, danger && { backgroundColor: Palette.dangerSoft }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && { color: Palette.danger }]}>{label}</Text>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {chevron && <Ionicons name="chevron-forward" size={18} color="#C7C7BF" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  name: { fontSize: 26, fontWeight: "800", color: Palette.text },
  email: { fontSize: 14, color: Palette.muted, marginTop: 2 },
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  editPillText: { fontSize: 13, fontWeight: "700", color: Palette.text },

  sectionLabel: { ...TextStyles.sectionTitle, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: Palette.card, borderRadius: 20, padding: 16, ...CardShadow },
  listCard: {
    backgroundColor: Palette.card,
    borderRadius: 20,
    overflow: "hidden",
    ...CardShadow,
  },

  person: { alignItems: "center", width: 70, marginRight: 6 },
  personRing: { padding: 3, borderRadius: 31, borderWidth: 2, borderColor: "transparent" },
  personRingOn: { borderColor: Palette.green },
  personCheck: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.green,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  personAdd: {
    width: 56,
    height: 56,
    borderRadius: 28,
    margin: 3,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D6D6D6",
    alignItems: "center",
    justifyContent: "center",
  },
  personName: { fontSize: 13, fontWeight: "700", color: Palette.text, marginTop: 6 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F0",
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D6D6D6",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowLabel: { fontSize: 15, fontWeight: "700", color: Palette.text },
  rowValue: { fontSize: 13, color: Palette.muted, marginTop: 2 },

  timeChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  timeChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Palette.bg,
  },
  timeChipOn: { borderColor: Palette.green, backgroundColor: Palette.greenSoft },
  timeChipText: { fontSize: 13, fontWeight: "600", color: Palette.muted },
  timeChipTextOn: { color: Palette.green, fontWeight: "700" },

  footnote: { fontSize: 12.5, color: Palette.muted, textAlign: "center", marginTop: 20 },

  perksCard: {
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 18,
    marginTop: 22,
    gap: 12,
    ...CardShadow,
  },
  perksTitle: { fontSize: 16, fontWeight: "800", color: Palette.text, marginBottom: 2 },
  perk: { flexDirection: "row", alignItems: "center" },
  perkIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  perkText: { flex: 1, fontSize: 14.5, color: Palette.text, lineHeight: 20 },
});
