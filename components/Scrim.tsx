import React from "react";
import { DimensionValue, StyleSheet, View } from "react-native";

// Assez de bandes pour qu'on ne distingue pas les marches.
const BANDS = 32;

// Dégradé sombre au bas d'une photo : le texte reste lisible sans éteindre
// le plat, qui doit rester l'élément le plus coloré de l'écran. Bandes
// superposées plutôt qu'une dépendance de dégradé.
export default function Scrim({
  height = "62%",
  strength = 0.8,
}: {
  height?: DimensionValue;
  strength?: number;
}) {
  return (
    <View style={[styles.scrim, { height }]}>
      {Array.from({ length: BANDS }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: `rgba(0,0,0,${(strength * ((i + 1) / BANDS) ** 1.6).toFixed(3)})`,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, pointerEvents: "none" },
});
