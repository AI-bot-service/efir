import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Button, TextField, SignalRing } from '../components';
import { colors, space, font, type } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';
import { activateWithCode, AuthError } from '../auth/authService';

/** Короткий человекочитаемый хост сервера — для строки «куда подключаемся». */
function serverHost(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
}

export function OnboardingScreen() {
  const { setDisplayName, completeOnboarding, clearPending } = useAppStore();
  const store = useAppStore.getState();
  // Адреса сервера уже заданы: зашитый конфиг или ссылка-приглашение.
  const serverUrl = store.serverUrl;
  const authUrl = store.authUrl;
  const pendingRoom = useAppStore((s) => s.pendingRoom);

  const [name, setName] = useState(store.displayName);
  const [code, setCode] = useState(store.pendingCode ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!name.trim() && !!code.trim() && !!authUrl && !busy;

  const activate = async () => {
    setError(null);
    setBusy(true);
    try {
      await activateWithCode(authUrl, code, name);
      setDisplayName(name.trim());
      const room = pendingRoom;
      clearPending();
      completeOnboarding();
      if (room) useAppStore.getState().joinRoom(room);
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
          hint={serverUrl ? `Подключение: ${serverHost(serverUrl)}` : undefined}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={pendingRoom ? 'Войти в эфир' : 'Активировать доступ'}
          onPress={activate}
          disabled={!canSubmit}
          loading={busy}
          style={{ marginTop: space.x6 }}
        />
        <Text style={styles.note}>
          {store.pendingCode
            ? 'Код подставлен из приглашения. Введите имя и продолжите.'
            : 'Введите имя и код из приглашения. Микрофон и камеру спросим при первом звонке.'}
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
