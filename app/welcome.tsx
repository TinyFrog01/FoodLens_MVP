import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import { PrimaryButton, SecondaryButton, TextButton } from "@/components/account/Buttons";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";

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
    title: "Régimes et allergies",
    text: "Les recettes à éviter disparaissent d'elles-mêmes.",
  },
  {
    icon: "stove",
    title: "Vos appareils",
    text: "Seulement des recettes que vous pouvez faire chez vous.",
  },
  {
    icon: "account-group-outline",
    title: "Toute la famille",
    text: "Choisissez pour qui vous cuisinez : les goûts de chacun comptent.",
  },
];

// Premier lancement : créer un compte, se connecter ou continuer en invité.
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { continueAsGuest } = useAccount();

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
          <Text style={TextStyles.eyebrow}>FOODLENS</Text>
          <Text style={styles.title}>Cuisinez avec ce que vous avez.</Text>
          <Text style={TextStyles.pageSubtitle}>
            Des recettes adaptées à votre cuisine, à vos goûts et à toute la famille.
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
          label="Créer un compte"
          onPress={() => router.push({ pathname: "/auth", params: { mode: "signup" } })}
        />
        <SecondaryButton
          label="J'ai déjà un compte"
          onPress={() => router.push({ pathname: "/auth", params: { mode: "login" } })}
        />
        <TextButton
          label="Continuer en tant qu'invité"
          color={Palette.muted}
          onPress={continueAsGuest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
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
