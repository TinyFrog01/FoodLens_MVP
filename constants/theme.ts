// Palette et styles partagés des écrans compte/profil, repris des écrans
// Kitchen Inventory (fond blanc cassé, cartes blanches, vert comme accent).
export const Palette = {
  bg: "#F7F6F3",
  card: "#FFFFFF",
  border: "#EDEDE8",
  borderStrong: "#E4E4DE",
  text: "#1C1C1A",
  muted: "#8E8E86",
  green: "#3E9C5C",
  greenBright: "#37B24D",
  greenSoft: "#EEF6F0",
  warn: "#C9822B",
  warnSoft: "#FDF3E6",
  danger: "#E85C41",
  dangerSoft: "#FFE9E3",
  ink: "#111111",
};

export const CardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

export const TextStyles = {
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.green,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pageTitle: { fontSize: 34, fontWeight: "800", color: Palette.text },
  pageSubtitle: { fontSize: 15, color: Palette.muted, marginTop: 4, lineHeight: 21 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: Palette.text },
  sectionHint: { fontSize: 13, color: Palette.muted, lineHeight: 18 },
} as const;
