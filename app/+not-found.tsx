import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/lib/i18n';

export default function NotFoundScreen() {
  const { tr } = useLanguage();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{tr("Cette page n'existe pas.", 'This screen does not exist.')}</ThemedText>
      <Link href="/" style={styles.link}>
        <ThemedText type="link">{tr("Retour à l'accueil", 'Go to home screen!')}</ThemedText>
      </Link>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
