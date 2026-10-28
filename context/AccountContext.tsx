import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  StoredState,
  createAccount,
  hashPassword,
  loadStoredState,
  makeSalt,
  normalizeEmail,
  saveStoredState,
} from "@/lib/account/storage";
import {
  Account,
  AuthResult,
  Member,
  RecipeCustomization,
  SELF_ID,
} from "@/lib/account/types";

export type AccountStatus = "loading" | "none" | "guest" | "account";

type AccountContextValue = {
  status: AccountStatus;
  account: Account | null;
  continueAsGuest: () => void;
  signUp: (input: { name: string; email: string; password: string }) => AuthResult;
  logIn: (input: { email: string; password: string }) => AuthResult;
  logOut: () => void;
  deleteAccount: () => void;
  updateAccount: (updater: (account: Account) => Account) => void;
  saveMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  setCookingFor: (memberIds: string[]) => void;
  toggleFavorite: (recipeId: string) => void;
  updateCustomization: (recipeId: string, patch: Partial<RecipeCustomization>) => void;
  resetCustomization: (recipeId: string) => void;
  completeOnboarding: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

function isEmptyCustomization(c: RecipeCustomization) {
  return (
    c.servings === undefined &&
    !c.note?.trim() &&
    (c.removed?.length ?? 0) === 0 &&
    Object.keys(c.swaps ?? {}).length === 0
  );
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredState | null>(null);
  // Miroir synchrone de l'état : les actions s'enchaînent sans lire une
  // valeur périmée entre deux rendus.
  const storedRef = useRef<StoredState | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadStoredState().then((state) => {
      if (cancelled) return;
      storedRef.current = state;
      setStored(state);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next: StoredState) => {
    storedRef.current = next;
    setStored(next);
    saveStoredState(next);
  }, []);

  const session = stored?.session ?? null;
  const account =
    session?.mode === "account" ? stored?.accounts[session.accountId]?.profile ?? null : null;
  const status: AccountStatus = !stored
    ? "loading"
    : session?.mode === "guest"
      ? "guest"
      : account
        ? "account"
        : "none";

  const continueAsGuest = useCallback(() => {
    const current = storedRef.current;
    if (!current) return;
    commit({ ...current, session: { mode: "guest" } });
  }, [commit]);

  const signUp = useCallback(
    ({ name, email, password }: { name: string; email: string; password: string }): AuthResult => {
      const current = storedRef.current;
      if (!current) return { ok: false, error: "Chargement en cours, réessaie." };
      const normalized = normalizeEmail(email);
      const taken = Object.values(current.accounts).some(
        (a) => a.profile.email === normalized
      );
      if (taken) {
        return {
          ok: false,
          error: "Un compte existe déjà avec ce courriel sur cet appareil. Connecte-toi.",
        };
      }
      const profile = createAccount(name, normalized);
      const salt = makeSalt();
      commit({
        ...current,
        session: { mode: "account", accountId: profile.id },
        accounts: {
          ...current.accounts,
          [profile.id]: { profile, auth: { salt, hash: hashPassword(password, salt) } },
        },
      });
      return { ok: true };
    },
    [commit]
  );

  const logIn = useCallback(
    ({ email, password }: { email: string; password: string }): AuthResult => {
      const current = storedRef.current;
      if (!current) return { ok: false, error: "Chargement en cours, réessaie." };
      const normalized = normalizeEmail(email);
      const entry = Object.values(current.accounts).find(
        (a) => a.profile.email === normalized
      );
      if (!entry) {
        return { ok: false, error: "Aucun compte avec ce courriel sur cet appareil." };
      }
      if (hashPassword(password, entry.auth.salt) !== entry.auth.hash) {
        return { ok: false, error: "Mot de passe incorrect." };
      }
      commit({ ...current, session: { mode: "account", accountId: entry.profile.id } });
      return { ok: true };
    },
    [commit]
  );

  const logOut = useCallback(() => {
    const current = storedRef.current;
    if (!current) return;
    commit({ ...current, session: null });
  }, [commit]);

  const deleteAccount = useCallback(() => {
    const current = storedRef.current;
    if (!current || current.session?.mode !== "account") return;
    const { [current.session.accountId]: _removed, ...rest } = current.accounts;
    commit({ ...current, session: null, accounts: rest });
  }, [commit]);

  const updateAccount = useCallback(
    (updater: (account: Account) => Account) => {
      const current = storedRef.current;
      if (!current || current.session?.mode !== "account") return;
      const entry = current.accounts[current.session.accountId];
      if (!entry) return;
      commit({
        ...current,
        accounts: {
          ...current.accounts,
          [entry.profile.id]: { ...entry, profile: updater(entry.profile) },
        },
      });
    },
    [commit]
  );

  const saveMember = useCallback(
    (member: Member) =>
      updateAccount((a) => {
        if (member.id === SELF_ID) return { ...a, self: member };
        const exists = a.members.some((m) => m.id === member.id);
        return exists
          ? { ...a, members: a.members.map((m) => (m.id === member.id ? member : m)) }
          : // un nouveau membre rejoint d'office le prochain repas
            { ...a, members: [...a.members, member], cookingFor: [...a.cookingFor, member.id] };
      }),
    [updateAccount]
  );

  const removeMember = useCallback(
    (memberId: string) =>
      updateAccount((a) => {
        const cookingFor = a.cookingFor.filter((id) => id !== memberId);
        return {
          ...a,
          members: a.members.filter((m) => m.id !== memberId),
          cookingFor: cookingFor.length > 0 ? cookingFor : [SELF_ID],
        };
      }),
    [updateAccount]
  );

  const setCookingFor = useCallback(
    (memberIds: string[]) =>
      updateAccount((a) => ({
        ...a,
        cookingFor: memberIds.length > 0 ? memberIds : [SELF_ID],
      })),
    [updateAccount]
  );

  const toggleFavorite = useCallback(
    (recipeId: string) =>
      updateAccount((a) => ({
        ...a,
        favorites: a.favorites.includes(recipeId)
          ? a.favorites.filter((id) => id !== recipeId)
          : [recipeId, ...a.favorites],
      })),
    [updateAccount]
  );

  const updateCustomization = useCallback(
    (recipeId: string, patch: Partial<RecipeCustomization>) =>
      updateAccount((a) => {
        const next = { ...a.customizations[recipeId], ...patch };
        const customizations = { ...a.customizations };
        if (isEmptyCustomization(next)) delete customizations[recipeId];
        else customizations[recipeId] = next;
        return { ...a, customizations };
      }),
    [updateAccount]
  );

  const resetCustomization = useCallback(
    (recipeId: string) =>
      updateAccount((a) => {
        const { [recipeId]: _removed, ...rest } = a.customizations;
        return { ...a, customizations: rest };
      }),
    [updateAccount]
  );

  const completeOnboarding = useCallback(
    () => updateAccount((a) => ({ ...a, onboarded: true })),
    [updateAccount]
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      status,
      account,
      continueAsGuest,
      signUp,
      logIn,
      logOut,
      deleteAccount,
      updateAccount,
      saveMember,
      removeMember,
      setCookingFor,
      toggleFavorite,
      updateCustomization,
      resetCustomization,
      completeOnboarding,
    }),
    [
      status,
      account,
      continueAsGuest,
      signUp,
      logIn,
      logOut,
      deleteAccount,
      updateAccount,
      saveMember,
      removeMember,
      setCookingFor,
      toggleFavorite,
      updateCustomization,
      resetCustomization,
      completeOnboarding,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount doit être utilisé dans <AccountProvider>");
  return ctx;
}
