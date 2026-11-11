import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/account/Buttons";
import TopBar from "@/components/account/TopBar";
import { Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useLanguage } from "@/lib/i18n";

type Mode = "signup" | "login";
type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

// Création de compte et connexion. En cas de succès, la navigation suit
// d'elle-même la nouvelle session (voir app/_layout.tsx).
export default function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { signUp, logIn } = useAccount();

  const [mode, setMode] = useState<Mode>(params.mode === "login" ? "login" : "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const isSignup = mode === "signup";
  const { tr } = useLanguage();

  const validate = (): Errors => {
    const next: Errors = {};
    if (isSignup && !name.trim()) next.name = tr("Entre ton prénom.", "Enter your first name.");
    if (!EMAIL_RE.test(email.trim())) next.email = tr("Entre un courriel valide.", "Enter a valid email.");
    if (isSignup && password.length < MIN_PASSWORD) {
      next.password = tr(`Au moins ${MIN_PASSWORD} caractères.`, `At least ${MIN_PASSWORD} characters.`);
    } else if (!password) {
      next.password = tr("Entre ton mot de passe.", "Enter your password.");
    }
    return next;
  };

  const submit = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    // Laisse le temps d'afficher l'indicateur : le hachage du mot de passe
    // bloque brièvement le fil JS.
    setTimeout(() => {
      const result = isSignup
        ? signUp({ name, email, password })
        : logIn({ email, password });
      if (!result.ok) {
        setErrors({ form: result.error });
        setBusy(false);
      }
    }, 30);
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setErrors({});
  };

  return (
    <View style={styles.page}>
      <TopBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={TextStyles.eyebrow}>
            {isSignup ? tr("CRÉER UN COMPTE", "CREATE AN ACCOUNT") : tr("CONNEXION", "LOG IN")}
          </Text>
          <Text style={TextStyles.pageTitle}>
            {isSignup ? tr("Bienvenue !", "Welcome!") : tr("Content de te revoir", "Good to see you again")}
          </Text>
          <Text style={TextStyles.pageSubtitle}>
            {isSignup
              ? tr(
                  "Ensuite, on configure ta cuisine en quelques étapes : appareils, régime, allergies et famille.",
                  "Next, we'll set up your kitchen in a few steps: appliances, diet, allergies and family."
                )
              : tr(
                  "Retrouve tes préférences, ta famille et tes recettes favorites.",
                  "Find your preferences, your family and your favorite recipes."
                )}
          </Text>

          <View style={styles.form}>
            {isSignup && (
              <Field label={tr("Prénom", "First name")} error={errors.name}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={tr("Ex. Philippe", "e.g. Philip")}
                  placeholderTextColor="#A6A6A0"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  style={styles.input}
                />
              </Field>
            )}

            <Field label={tr("Courriel", "Email")} error={errors.email}>
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                placeholder={tr("toi@exemple.com", "you@example.com")}
                placeholderTextColor="#A6A6A0"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={styles.input}
              />
            </Field>

            <Field label={tr("Mot de passe", "Password")} error={errors.password}>
              <View>
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={
                    isSignup
                      ? tr(`${MIN_PASSWORD} caractères minimum`, `${MIN_PASSWORD} characters minimum`)
                      : tr("Ton mot de passe", "Your password")
                  }
                  placeholderTextColor="#A6A6A0"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  textContentType={isSignup ? "newPassword" : "password"}
                  returnKeyType="go"
                  onSubmitEditing={submit}
                  style={[styles.input, { paddingRight: 48 }]}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eye}
                  hitSlop={8}
                  accessibilityLabel={
                    showPassword ? tr("Masquer le mot de passe", "Hide the password") : tr("Afficher le mot de passe", "Show the password")
                  }
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Palette.muted}
                  />
                </Pressable>
              </View>
            </Field>

            {errors.form ? (
              <View style={styles.formError}>
                <Ionicons name="alert-circle-outline" size={18} color={Palette.danger} />
                <Text style={styles.formErrorText}>{errors.form}</Text>
              </View>
            ) : null}

            <PrimaryButton
              label={isSignup ? tr("Créer mon compte", "Create my account") : tr("Se connecter", "Log in")}
              onPress={submit}
              loading={busy}
              style={{ marginTop: 8 }}
            />

            <Pressable onPress={switchMode} style={styles.switch} hitSlop={8}>
              <Text style={styles.switchText}>
                {isSignup ? tr("Déjà un compte ? ", "Already have an account? ") : tr("Pas encore de compte ? ", "No account yet? ")}
                <Text style={styles.switchLink}>
                  {isSignup ? tr("Se connecter", "Log in") : tr("Créer un compte", "Create an account")}
                </Text>
              </Text>
            </Pressable>
          </View>

          <View style={styles.note}>
            <Ionicons name="lock-closed-outline" size={15} color={Palette.muted} />
            <Text style={styles.noteText}>
              {tr(
                "Ton compte est enregistré sur cet appareil. Ton mot de passe n'est jamais conservé en clair.",
                "Your account is saved on this device. Your password is never stored in plain text."
              )}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  form: { marginTop: 26 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: Palette.text, marginBottom: 7 },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Palette.text,
  },
  eye: { position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" },
  fieldError: { color: Palette.danger, fontSize: 13, marginTop: 6, fontWeight: "600" },
  formError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.dangerSoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  formErrorText: { flex: 1, color: Palette.danger, fontSize: 14, fontWeight: "600" },
  switch: { alignItems: "center", paddingVertical: 18 },
  switchText: { fontSize: 15, color: Palette.muted },
  switchLink: { color: Palette.green, fontWeight: "700" },
  note: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 8 },
  noteText: { flex: 1, fontSize: 12.5, color: Palette.muted, lineHeight: 18 },
});
