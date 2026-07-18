import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Alert } from 'react-native';
import { Screen, TextField, Toggle, Button } from '../components';
import { colors, space, font, type, radius } from '../theme/tokens';
import { useAppStore, normalizeServer } from '../store/useAppStore';
import { resetAccess as clearAuth } from '../auth/authService';
import type { QualityProfile } from '../jitsi/config';

export function SettingsScreen() {
  const s = useAppStore();
  const [name, setName] = useState(s.displayName);
  const [server, setServer] = useState(s.serverUrl);
  const [authUrl, setAuthUrl] = useState(s.authUrl);

  const commitName = () => s.setDisplayName(name.trim());
  const commitServer = () => {
    const v = normalizeServer(server);
    setServer(v);
    s.setServerUrl(v);
  };
  const commitAuth = () => {
    const v = normalizeServer(authUrl);
    setAuthUrl(v);
    s.setAuthUrl(v);
  };

  const confirmReset = () => {
    Alert.alert(
      'Сбросить доступ?',
      'Код приглашения будет удалён с устройства. Для повторного входа понадобится код.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            await clearAuth();
            s.resetAccess();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        <Pressable onPress={() => s.navigate('home')} hitSlop={10} accessibilityLabel="Назад">
          <Text style={styles.back}>‹ Эфир</Text>
        </Pressable>
        <Text style={styles.title}>Настройки</Text>
      </View>

      <Section title="Профиль">
        <TextField
          label="Имя"
          value={name}
          onChangeText={setName}
          onBlur={commitName}
          autoCapitalize="words"
        />
        <TextField
          label="Сервер видеосвязи"
          containerStyle={{ marginTop: space.x4 }}
          value={server}
          onChangeText={setServer}
          onBlur={commitServer}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TextField
          label="Сервер доступа"
          containerStyle={{ marginTop: space.x4 }}
          value={authUrl}
          onChangeText={setAuthUrl}
          onBlur={commitAuth}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </Section>

      <Section title="Качество и батарея">
        <QualityPicker value={s.profile} onChange={s.setProfile} />
        <View style={styles.divider} />
        <Toggle
          title="Входить с выключенной камерой"
          subtitle="Экономит батарею и трафик на старте"
          value={s.startWithVideoMuted}
          onChange={s.setStartWithVideoMuted}
        />
        <Toggle
          title="Входить с выключенным микрофоном"
          value={s.startWithAudioMuted}
          onChange={s.setStartWithAudioMuted}
        />
      </Section>

      <Section title="О приложении">
        <Text style={styles.about}>
          Efir — клиент видеоконференций на движке Jitsi. Оптимизирован для звонков на 3–5 человек:
          адаптивный битрейт, приём только активных говорящих, экономия батареи.
        </Text>
        <Text style={styles.version}>Версия 0.1.0 · com.systemtool.efir</Text>
      </Section>

      <Button label="Сбросить доступ" variant="danger" onPress={confirmReset} />
      <View style={{ height: space.x8 }} />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function QualityPicker({ value, onChange }: { value: QualityProfile; onChange: (v: QualityProfile) => void }) {
  const opts: { key: QualityProfile; title: string; desc: string }[] = [
    { key: 'balanced', title: 'Баланс', desc: '360p · 24 fps' },
    { key: 'saver', title: 'Эконом', desc: '180p · 15 fps · меньше расход' },
  ];
  return (
    <View style={styles.segments}>
      {opts.map((o) => {
        const on = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.segment, on && styles.segmentOn]}
            accessibilityState={{ selected: on }}>
            <Text style={[styles.segTitle, on && styles.segTitleOn]}>{o.title}</Text>
            <Text style={[styles.segDesc, on && styles.segDescOn]}>{o.desc}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { marginTop: space.x4, marginBottom: space.x6 },
  back: { fontFamily: font.medium, fontSize: 15, color: colors.accentHi },
  title: { ...type.h1, color: colors.text, marginTop: space.x3 },

  section: { marginBottom: space.x8 },
  sectionTitle: {
    ...type.eyebrow,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: space.x3,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.x4,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.x2 },

  segments: { flexDirection: 'row', gap: space.x3 },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.x4,
    backgroundColor: colors.bgElevated,
  },
  segmentOn: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  segTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  segTitleOn: { color: colors.accentHi },
  segDesc: { fontFamily: font.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  segDescOn: { color: colors.accentHi },

  about: { ...type.body, color: colors.textMuted },
  version: { fontFamily: font.mono, fontSize: 12, color: colors.textFaint, marginTop: space.x3 },
});
