import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ALLERGENS,
  APPLIANCES,
  DEFAULT_APPLIANCES,
  DIETS,
  MEMBER_COLORS,
} from "@/constants/dietary";

import { sha256Hex } from "./sha256";
import { Account, Member, RecipeCustomization, SELF_ID } from "./types";

// Tout l'état des comptes tient sous une seule clé : une écriture = un
// instantané cohérent (session + comptes). Les comptes vivent uniquement sur
// cet appareil ; brancher un vrai backend se fera dans ce fichier.
const STORAGE_KEY = "foodlens.accounts.v1";

export type Session = { mode: "guest" } | { mode: "account"; accountId: string } | null;

export type StoredAccount = {
  profile: Account;
  auth: { salt: string; hash: string };
};

export type StoredState = {
  version: 1;
  session: Session;
  accounts: Record<string, StoredAccount>;
};

const EMPTY_STATE: StoredState = { version: 1, session: null, accounts: {} };

export const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

// ─────────────────────────────────────────────
// Mots de passe : sel aléatoire + SHA-256 itéré, jamais en clair.
// ─────────────────────────────────────────────
const HASH_ROUNDS = 1000;

export function hashPassword(password: string, salt: string) {
  let digest = `${salt}:${password}`;
  for (let i = 0; i < HASH_ROUNDS; i++) {
    digest = sha256Hex(`${digest}:${password}`);
  }
  return digest;
}

export function makeSalt() {
  let salt = "";
  for (let i = 0; i < 4; i++) {
    salt += Math.random().toString(36).slice(2, 10);
  }
  return salt;
}

// ─────────────────────────────────────────────
// Fabriques
// ─────────────────────────────────────────────
export function createMember(partial: Partial<Member> & { name: string }): Member {
  return {
    id: generateId(),
    color: MEMBER_COLORS[0],
    diets: [],
    allergens: [],
    avoid: [],
    likes: [],
    dislikes: [],
    ...partial,
  };
}

export function createAccount(name: string, email: string): Account {
  return {
    id: generateId(),
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
    onboarded: false,
    self: createMember({ id: SELF_ID, name: name.trim() }),
    members: [],
    appliances: [...DEFAULT_APPLIANCES],
    showMissingAppliances: false,
    maxMinutes: null,
    cookingFor: [SELF_ID],
    favorites: [],
    customizations: {},
  };
}

// ─────────────────────────────────────────────
// Lecture défensive : un état stocké par une version antérieure (ou abîmé)
// ne doit jamais faire planter l'app — on complète avec les valeurs par défaut.
// ─────────────────────────────────────────────
const DIET_KEYS = new Set<string>(DIETS.map((d) => d.key));
const ALLERGEN_KEYS = new Set<string>(ALLERGENS.map((a) => a.key));
const APPLIANCE_KEYS = new Set<string>(APPLIANCES.map((a) => a.key));

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const keyList = <T extends string>(value: unknown, allowed: Set<string>) =>
  stringList(value).filter((v) => allowed.has(v)) as T[];

function normalizeMember(raw: any, fallbackId: string): Member {
  return {
    id: typeof raw?.id === "string" ? raw.id : fallbackId,
    name: typeof raw?.name === "string" ? raw.name : "",
    color: typeof raw?.color === "string" ? raw.color : MEMBER_COLORS[0],
    diets: keyList(raw?.diets, DIET_KEYS),
    allergens: keyList(raw?.allergens, ALLERGEN_KEYS),
    avoid: stringList(raw?.avoid),
    likes: stringList(raw?.likes),
    dislikes: stringList(raw?.dislikes),
  };
}

function normalizeCustomizations(raw: any): Record<string, RecipeCustomization> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, RecipeCustomization> = {};
  for (const [recipeId, value] of Object.entries<any>(raw)) {
    if (!value || typeof value !== "object") continue;
    const swaps: Record<string, string> = {};
    if (value.swaps && typeof value.swaps === "object") {
      for (const [from, to] of Object.entries(value.swaps)) {
        if (typeof to === "string" && to.trim()) swaps[from] = to;
      }
    }
    out[recipeId] = {
      servings: typeof value.servings === "number" ? value.servings : undefined,
      note: typeof value.note === "string" ? value.note : undefined,
      removed: stringList(value.removed),
      swaps,
    };
  }
  return out;
}

function normalizeAccount(raw: any): Account | null {
  if (!raw || typeof raw.id !== "string" || typeof raw.email !== "string") return null;
  const self = normalizeMember(raw.self, SELF_ID);
  self.id = SELF_ID;
  const members = Array.isArray(raw.members)
    ? raw.members.map((m: any, i: number) => normalizeMember(m, `member-${i}`))
    : [];
  const knownIds = new Set([SELF_ID, ...members.map((m: Member) => m.id)]);
  const cookingFor = stringList(raw.cookingFor).filter((id) => knownIds.has(id));

  return {
    id: raw.id,
    email: raw.email,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    onboarded: raw.onboarded !== false,
    self,
    members,
    appliances: Array.isArray(raw.appliances)
      ? keyList(raw.appliances, APPLIANCE_KEYS)
      : [...DEFAULT_APPLIANCES],
    showMissingAppliances: raw.showMissingAppliances === true,
    maxMinutes: typeof raw.maxMinutes === "number" ? raw.maxMinutes : null,
    cookingFor: cookingFor.length > 0 ? cookingFor : [SELF_ID],
    favorites: stringList(raw.favorites),
    customizations: normalizeCustomizations(raw.customizations),
  };
}

export async function loadStoredState(): Promise<StoredState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);

    const accounts: Record<string, StoredAccount> = {};
    for (const entry of Object.values<any>(parsed?.accounts ?? {})) {
      const profile = normalizeAccount(entry?.profile);
      const salt = entry?.auth?.salt;
      const hash = entry?.auth?.hash;
      if (profile && typeof salt === "string" && typeof hash === "string") {
        accounts[profile.id] = { profile, auth: { salt, hash } };
      }
    }

    let session: Session = null;
    if (parsed?.session?.mode === "guest") {
      session = { mode: "guest" };
    } else if (
      parsed?.session?.mode === "account" &&
      typeof parsed.session.accountId === "string" &&
      accounts[parsed.session.accountId]
    ) {
      session = { mode: "account", accountId: parsed.session.accountId };
    }

    return { version: 1, session, accounts };
  } catch (err) {
    console.warn("Lecture des comptes impossible", err);
    return EMPTY_STATE;
  }
}

export async function saveStoredState(state: StoredState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Enregistrement des comptes impossible", err);
  }
}
