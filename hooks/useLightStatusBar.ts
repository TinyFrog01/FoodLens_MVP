import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";

// Écrans sombres (photos plein écran, caméra) : heure et batterie en blanc
// tant que l'écran est affiché, puis retour au style sombre des écrans clairs.
// enabled = false : l'écran est clair pour l'instant (ex. fil vide).
export function useLightStatusBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [enabled])
  );
}
