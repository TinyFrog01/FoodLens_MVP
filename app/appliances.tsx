import React from "react";
import { Dimensions, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OptionTile from "@/components/account/OptionTile";
import TopBar from "@/components/account/TopBar";
import { APPLIANCES } from "@/constants/dietary";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useLanguage } from "@/lib/i18n";

const { width } = Dimensions.get("window");
const TILE_WIDTH = (width - 40 - 12) / 2;

// Appareils de cuisine du compte (enregistrés à chaque changement).
export default function AppliancesScreen() {
  const insets = useSafeAreaInsets();
  const { account, updateAccount } = useAccount();
  const { tr } = useLanguage();
  if (!account) return null;

  return (
    <View style={styles.page}>
      <TopBar />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={TextStyles.eyebrow}>{tr("TES PRÉFÉRENCES", "YOUR PREFERENCES")}</Text>
        <Text style={TextStyles.pageTitle}>{tr("Tes appareils", "Your appliances")}</Text>
        <Text style={TextStyles.pageSubtitle}>
          {tr("Coche ce que tu as dans ta cuisine.", "Check what you have in your kitchen.")}
        </Text>

        <View style={styles.grid}>
          {APPLIANCES.map((a) => {
            const on = account.appliances.includes(a.key);
            return (
              <OptionTile
                key={a.key}
                label={a.label}
                icon={a.icon}
                selected={on}
                onPress={() =>
                  updateAccount((acc) => ({
                    ...acc,
                    appliances: on
                      ? acc.appliances.filter((k) => k !== a.key)
                      : [...acc.appliances, a.key],
                  }))
                }
                style={{ width: TILE_WIDTH }}
              />
            );
          })}
        </View>

        <View style={styles.switchCard}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.switchTitle}>{tr("Afficher aussi les autres recettes", "Show the other recipes too")}</Text>
            <Text style={TextStyles.sectionHint}>
              {tr(
                "Les recettes qui demandent un appareil que tu n'as pas restent visibles, avec une mention « Nécessite ».",
                "Recipes that need an appliance you don't have stay visible, marked “Needs”."
              )}
            </Text>
          </View>
          <Switch
            value={account.showMissingAppliances}
            onValueChange={(value) =>
              updateAccount((acc) => ({ ...acc, showMissingAppliances: value }))
            }
            trackColor={{ true: Palette.green, false: "#D9D9D3" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 20,
  },
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    ...CardShadow,
  },
  switchTitle: { fontSize: 15, fontWeight: "700", color: Palette.text, marginBottom: 4 },
});
