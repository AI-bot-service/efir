import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { JitsiMeeting } from '@jitsi/react-native-sdk';
import type { JitsiRefProps } from '@jitsi/react-native-sdk';
import { useAppStore } from '../store/useAppStore';
import { buildConfigOverwrite, efirFlags } from '../jitsi/config';
import { getValidToken, AuthError } from '../auth/authService';
import { colors, type, space } from '../theme/tokens';

export function MeetingScreen() {
  const jitsiRef = useRef<JitsiRefProps>(null);
  const {
    activeRoom,
    serverUrl,
    authUrl,
    displayName,
    profile,
    startWithVideoMuted,
    startWithAudioMuted,
    leaveMeeting,
    resetAccess,
  } = useAppStore();

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Свежий JWT перед входом в звонок.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await getValidToken(authUrl, displayName || 'Гость');
        if (alive) setToken(t);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof AuthError ? e.message : 'Не удалось получить доступ');
        if (e instanceof AuthError && e.code === 'invalid_code') {
          // код отозван/протух — сбрасываем доступ
          setTimeout(() => resetAccess(), 1500);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [authUrl, displayName, resetAccess]);

  const onReadyToClose = useCallback(() => {
    jitsiRef.current?.close();
    leaveMeeting();
  }, [leaveMeeting]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  if (!activeRoom) return null;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{error}</Text>
        <Text style={styles.hint}>Возврат…</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.hint}>Подключение к эфиру…</Text>
      </View>
    );
  }

  const config = buildConfigOverwrite({
    displayName,
    profile,
    startWithVideoMuted,
    startWithAudioMuted,
  });

  return (
    <View style={styles.root}>
      <JitsiMeeting
        ref={jitsiRef}
        room={activeRoom}
        serverURL={serverUrl}
        token={token}
        config={config}
        flags={efirFlags}
        userInfo={{ displayName: displayName || 'Гость', email: '', avatarURL: '' }}
        style={styles.meeting}
        eventListeners={{ onReadyToClose, onConferenceLeft: () => {} }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  meeting: { flex: 1 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  hint: { ...type.caption, marginTop: space.x4 },
  err: { ...type.bodyMed, color: colors.danger, textAlign: 'center', paddingHorizontal: space.x8 },
});
