import { Alert, Platform } from "react-native";

// Alert.alert avec boutons ne fait rien sur le web : on retombe sur window.confirm.
export function confirmAction({
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuler",
  destructive = false,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
