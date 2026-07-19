import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator, Linking } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { decodeInvite } from './src/invite/invite';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MeetingScreen } from './src/screens/MeetingScreen';
import { InviteScreen } from './src/screens/InviteScreen';
import { colors } from './src/theme/tokens';

function Router() {
  const route = useAppStore((s) => s.route);
  const hydrated = useAppStore((s) => s.hydrated);

  // Ждём восстановления сохранённых данных, чтобы не мелькал онбординг.
  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  switch (route) {
    case 'onboarding':
      return <OnboardingScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'meeting':
      return <MeetingScreen />;
    case 'invite':
      return <InviteScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}

function useInviteLinks() {
  const hydrated = useAppStore((s) => s.hydrated);
  const applyInvite = useAppStore((s) => s.applyInvite);

  useEffect(() => {
    if (!hydrated) return; // applyInvite опирается на onboarded — ждём загрузки
    const handle = (url: string | null) => {
      if (!url) return;
      const inv = decodeInvite(url);
      if (inv) applyInvite(inv);
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, [hydrated, applyInvite]);
}

export default function App() {
  useInviteLinks();
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Router />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
