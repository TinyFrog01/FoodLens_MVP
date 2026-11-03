import React, { useId } from "react";
import { DimensionValue, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

// Assez d'arrêts pour suivre la courbe sans qu'on voie de marche.
const STOPS = 12;

// Dégradé sombre au bas d'une photo (ou en haut, sous la barre d'état) : le
// texte reste lisible sans éteindre le plat, qui doit rester l'élément le plus
// coloré de l'écran. Un vrai dégradé SVG : des bandes superposées laissaient
// voir leurs marches et leurs jointures sur téléphone.
export default function Scrim({
  height = "62%",
  strength = 0.8,
  edge = "bottom",
}: {
  height?: DimensionValue;
  strength?: number;
  edge?: "top" | "bottom";
}) {
  // Sur le web, les id SVG sont communs à toute la page : un par dégradé.
  const id = `scrim${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // du transparent (début) vers le bord sombre (fin)
  const [from, to] = edge === "top" ? ["1", "0"] : ["0", "1"];

  return (
    <View style={[styles.scrim, edge === "top" ? styles.top : styles.bottom, { height }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1={from} x2="0" y2={to}>
            {Array.from({ length: STOPS + 1 }, (_, i) => (
              <Stop
                key={i}
                offset={i / STOPS}
                stopColor="#000"
                stopOpacity={strength * (i / STOPS) ** 1.6}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { position: "absolute", left: 0, right: 0, pointerEvents: "none" },
  top: { top: 0 },
  bottom: { bottom: 0 },
});
