import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";

// Écrans sombres (photos plein écran, caméra) : heure et batterie en blanc
// tant que l'écran est affiché, puis retour au style sombre des écrans clairs.
export function useLightStatusBar() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );
}
