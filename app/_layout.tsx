import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AccountProvider, useAccount } from '@/context/AccountContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AccountProvider>
        <RootNavigator />
      </AccountProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Les écrans accessibles dépendent de la session : premier lancement ->
// accueil (compte ou invité) ; compte tout juste créé -> configuration ;
// sinon l'app. Quand la session change, Stack.Protected redirige seul vers
// le premier écran autorisé (ex. déconnexion -> accueil).
function RootNavigator() {
  const { status, account } = useAccount();

  if (status === 'loading') {
    return null;
  }

  const needsOnboarding = status === 'account' && !account?.onboarded;
  const ready = status === 'guest' || (status === 'account' && !needsOnboarding);

  return (
    <Stack>
      <Stack.Protected guard={status === 'none'}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={ready}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="photo-detail" />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="appliances" options={{ headerShown: false }} />
        <Stack.Screen name="my-recipes" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Création de compte / connexion : depuis l'accueil, ou en invité. */}
      <Stack.Protected guard={status !== 'account'}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Fiche d'un membre : utilisée pendant la configuration et depuis le profil. */}
      <Stack.Protected guard={status === 'account'}>
        <Stack.Screen name="member" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
