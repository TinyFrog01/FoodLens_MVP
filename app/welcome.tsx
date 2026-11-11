import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import LanguageSwitch from "@/components/LanguageSwitch";
import { PrimaryButton, SecondaryButton, TextButton } from "@/components/account/Buttons";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { tr, useLanguage } from "@/lib/i18n";

const { width } = Dimensions.get("window");
const TILE_WIDTH = (width - 40 - 20) / 3;

const MOSAIC = [
  ["arroz-con-pollo", "tarte-aux-pommes"],
  ["salade-de-poulet-asiatique", "pancakes-aux-bananes"],
  ["couscous-algerien-viande-legumes", "lasagne-de-base"],
];

const BENEFITS: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  text: string;
}[] = [
  {
    icon: "shield-check-outline",
    get title() { return tr("Régimes et allergies", "Diets and allergies"); },
    get text() { return tr("Les recettes à éviter disparaissent d'elles-mêmes.", "Recipes to avoid disappear on their own."); },
  },
  {
    icon: "stove",
    get title() { return tr("Vos appareils", "Your appliances"); },
    get text() { return tr("Seulement des recettes que vous pouvez faire chez vous.", "Only recipes you can make at home."); },
  },
  {
    icon: "account-group-outline",
    get title() { return tr("Toute la famille", "The whole family"); },
    get text() {
      return tr(
        "Choisissez pour qui vous cuisinez : les goûts de chacun comptent.",
        "Choose who you're cooking for: everyone's tastes count."
      );
    },
  },
];

// Premier lancement : créer un compte, se connecter ou continuer en invité.
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { continueAsGuest } = useAccount();
  useLanguage(); // redessine l'écran quand la langue change

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mosaic}>
          {MOSAIC.map((column, i) => (
            <View key={i} style={[styles.column, i === 1 && { marginTop: 28 }]}>
              {column.map((id) => (
                <Image key={id} source={getRecipePhoto(id)} style={styles.tile} />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.body}>
          <View style={styles.brandRow}>
            <Text style={TextStyles.eyebrow}>FOODLENS</Text>
            <LanguageSwitch compact />
          </View>
          <Text style={styles.title}>{tr("Cuisinez avec ce que vous avez.", "Cook with what you have.")}</Text>
          <Text style={TextStyles.pageSubtitle}>
            {tr(
              "Des recettes adaptées à votre cuisine, à vos goûts et à toute la famille.",
              "Recipes suited to your kitchen, your tastes and the whole family."
            )}
          </Text>

          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <MaterialCommunityIcons name={b.icon} size={20} color={Palette.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label={tr("Créer un compte", "Create an account")}
          onPress={() => router.push({ pathname: "/auth", params: { mode: "signup" } })}
        />
        <SecondaryButton
          label={tr("J'ai déjà un compte", "I already have an account")}
          onPress={() => router.push({ pathname: "/auth", params: { mode: "login" } })}
        />
        <TextButton
          label={tr("Continuer en tant qu'invité", "Continue as a guest")}
          color={Palette.muted}
          onPress={continueAsGuest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mosaic: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 236,
    overflow: "hidden",
  },
  column: { width: TILE_WIDTH, gap: 10 },
  tile: { width: TILE_WIDTH, height: 112, borderRadius: 18, backgroundColor: "#E9E8E3" },
  body: { paddingHorizontal: 20, marginTop: 22 },
  title: { fontSize: 32, fontWeight: "800", color: Palette.text, lineHeight: 38 },
  benefits: {
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    gap: 14,
    ...CardShadow,
  },
  benefit: { flexDirection: "row", alignItems: "center" },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTitle: { fontSize: 15, fontWeight: "700", color: Palette.text },
  benefitText: { fontSize: 13, color: Palette.muted, marginTop: 2, lineHeight: 18 },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    backgroundColor: Palette.bg,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
});
