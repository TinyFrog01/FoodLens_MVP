import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Palette } from '@/constants/theme';
import { AccountProvider, useAccount } from '@/context/AccountContext';

// Un seul thème, clair comme les écrans (fond blanc cassé, encre), même quand
// le téléphone est en mode sombre : barres et écrans restent harmonisés.
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.ink,
    background: Palette.bg,
    card: Palette.card,
    text: Palette.text,
    border: Palette.border,
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={theme}>
      <AccountProvider>
        <RootNavigator />
      </AccountProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

// Les écrans accessibles dépendent de la session : premier lancement ->
// accueil (compte ou invité) ; compte tout juste créé -> configuration ;
// sinon l'app. Quand la session change, chaque Stack.Protected renvoie vers
// `home`, le premier écran permis (ex. déconnexion -> accueil). Sans
// redirectTo, expo-router prend la première route libre dans son propre
// ordre : la déconnexion tombait sur otheridea.
function RootNavigator() {
  const { status, account } = useAccount();

  if (status === 'loading') {
    return null;
  }

  const needsOnboarding = status === 'account' && !account?.onboarded;
  const ready = status === 'guest' || (status === 'account' && !needsOnboarding);
  const home = status === 'none' ? '/welcome' : needsOnboarding ? '/onboarding' : '/';

  return (
    <Stack>
      <Stack.Protected guard={status === 'none'} redirectTo={home}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={needsOnboarding} redirectTo={home}>
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={ready} redirectTo={home}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="photo-detail" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="appliances" options={{ headerShown: false }} />
        <Stack.Screen name="my-recipes" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Création de compte / connexion : depuis l'accueil, ou en invité. */}
      <Stack.Protected guard={status !== 'account'} redirectTo={home}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Fiche d'un membre : utilisée pendant la configuration et depuis le profil. */}
      <Stack.Protected guard={status === 'account'} redirectTo={home}>
        <Stack.Screen name="member" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
