import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Button, TextField, SignalRing } from '../components';
import { colors, space, font, type } from '../theme/tokens';
import { useAppStore, normalizeServer } from '../store/useAppStore';
import { activateWithCode, AuthError } from '../auth/authService';

export function OnboardingScreen() {
  const { setDisplayName, setServerUrl, setAuthUrl, completeOnboarding } = useAppStore();
  const [name, setName] = useState('');
  const [server, setServer] = useState('');
  const [authUrl, setAuthUrlLocal] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!name.trim() && !!server.trim() && !!authUrl.trim() && !!code.trim() && !busy;

  const activate = async () => {
    setError(null);
    setBusy(true);
    try {
      const auth = normalizeServer(authUrl);
      await activateWithCode(auth, code, name);
      setDisplayName(name.trim());
      setServerUrl(normalizeServer(server));
      setAuthUrl(auth);
      completeOnboarding();
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Не удалось активировать доступ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <SignalRing size={170} active>
          <Text style={styles.mark}>Э</Text>
        </SignalRing>
        <Text style={styles.wordmark}>ЭФИР</Text>
        <Text style={styles.tag}>Доступ по приглашению</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Как вас зовут"
          placeholder="Ваше имя"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextField
          label="Код доступа"
          containerStyle={{ marginTop: space.x4 }}
          mono
          placeholder="XXXX-XXXX"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TextField
          label="Сервер видеосвязи"
          containerStyle={{ marginTop: space.x4 }}
          placeholder="meet.example.ru"
          value={server}
          onChangeText={setServer}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TextField
          label="Сервер доступа"
          containerStyle={{ marginTop: space.x4 }}
          placeholder="auth.example.ru"
          value={authUrl}
          onChangeText={setAuthUrlLocal}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          hint="Выдаётся вместе с кодом приглашения"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Активировать доступ"
          onPress={activate}
          disabled={!canSubmit}
          loading={busy}
          style={{ marginTop: space.x6 }}
        />
        <Text style={styles.note}>
          Без кода приглашения вход невозможен. Микрофон и камеру спросим при первом звонке.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: space.x8, marginBottom: space.x8 },
  mark: { fontFamily: font.displayBold, fontSize: 48, color: colors.accent },
  wordmark: {
    fontFamily: font.monoBold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: 10,
    marginTop: space.x5,
  },
  tag: { ...type.body, color: colors.textMuted, marginTop: space.x2 },
  form: { marginTop: space.x2 },
  error: {
    ...type.bodyMed,
    color: colors.danger,
    marginTop: space.x4,
    textAlign: 'center',
  },
  note: { ...type.caption, textAlign: 'center', marginTop: space.x4 },
});
