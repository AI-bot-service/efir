import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MeetingScreen } from './src/screens/MeetingScreen';
import { colors } from './src/theme/tokens';

function Router() {
  const route = useAppStore((s) => s.route);
  switch (route) {
    case 'onboarding':
      return <OnboardingScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'meeting':
      return <MeetingScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}

export default function App() {
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
});
