import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Palette } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";

import Avatar from "./Avatar";

// Accès au compte, en haut à droite des écrans principaux.
export default function AvatarButton({ onDark = false }: { onDark?: boolean }) {
  const router = useRouter();
  const { account } = useAccount();

  return (
    <Pressable
      onPress={() => router.push("/profile")}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={account ? "Mon compte" : "Créer un compte"}
      style={({ pressed }) => [styles.wrap, onDark && styles.onDark, pressed && { opacity: 0.8 }]}
    >
      {account ? (
        <Avatar name={account.self.name} color={account.self.color} size={38} bordered={onDark} />
      ) : (
        <View style={[styles.guest, onDark && styles.guestOnDark]}>
          <Ionicons name="person" size={18} color={onDark ? "#FFFFFF" : Palette.muted} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 20 },
  onDark: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  guest: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  guestOnDark: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderColor: "rgba(255,255,255,0.8)",
    borderWidth: 2,
  },
});
