import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Share, Pressable } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Screen, Button, TextField } from '../components';
import { colors, space, type, font, radius, shadow } from '../theme/tokens';
import { useAppStore, generateRoomName } from '../store/useAppStore';
import { getInviteCode } from '../auth/secureStore';
import { encodeInvite } from '../invite/invite';

/**
 * Экран «Пригласить»: превращает код доступа + комнату в QR/ссылку.
 * Собеседник открывает ссылку (или сканирует QR) → приложение подставляет
 * сервер и код, остаётся ввести имя.
 */
export function InviteScreen() {
  const { serverUrl, authUrl, navigate } = useAppStore();
  const [code, setCode] = useState('');
  const [room, setRoom] = useState('');
  const [copied, setCopied] = useState(false);

  // Свой код из Keychain — как значение по умолчанию для быстрого приглашения.
  useEffect(() => {
    getInviteCode().then((c) => {
      if (c) setCode(c);
    });
  }, []);

  const canShare = !!code.trim() && !!serverUrl && !!authUrl;
  const link = canShare
    ? encodeInvite({
        code: code.trim(),
        server: serverUrl,
        authUrl,
        room: room.trim() || undefined,
      })
    : '';

  const share = async () => {
    if (!link) return;
    try {
      await Share.share({
        message: `Приглашение в Эфир${room.trim() ? ` — комната «${room.trim()}»` : ''}:\n${link}\n\nОткройте ссылку в приложении Эфир.`,
      });
    } catch {
      // отменили — норм
    }
  };

  const copy = () => {
    if (!link) return;
    Clipboard.setString(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('home')} hitSlop={10} accessibilityLabel="Назад">
          <Text style={styles.back}>‹ Назад</Text>
        </Pressable>
        <Text style={styles.title}>Пригласить</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.qrCard}>
        {canShare ? (
          <QRCode
            value={link}
            size={196}
            backgroundColor="#FFFFFF"
            color="#0B0D10"
            ecl="M"
          />
        ) : (
          <Text style={styles.qrEmpty}>Введите код доступа{'\n'}для генерации приглашения</Text>
        )}
      </View>
      <Text style={styles.hint}>
        Собеседник наводит камеру на QR или открывает вашу ссылку — попадёт сразу в Эфир, введёт только имя.
      </Text>

      <View style={styles.form}>
        <TextField
          label="Код доступа"
          mono
          placeholder="XXXX-XXXX"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          hint="По умолчанию — ваш код. Можно вставить гостевой, созданный на сервере."
        />
        <TextField
          label="Комната (необязательно)"
          containerStyle={{ marginTop: space.x4 }}
          mono
          placeholder={generateRoomName()}
          value={room}
          onChangeText={setRoom}
          autoCapitalize="none"
          autoCorrect={false}
          hint="Если указать — собеседник сразу войдёт в эту комнату."
        />

        <Button
          label="Поделиться ссылкой"
          onPress={share}
          disabled={!canShare}
          style={{ marginTop: space.x6 }}
        />
        <Button
          label={copied ? 'Ссылка скопирована ✓' : 'Скопировать ссылку'}
          variant="secondary"
          onPress={copy}
          disabled={!canShare}
          style={{ marginTop: space.x3 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.x4,
    marginBottom: space.x6,
  },
  back: { ...type.bodyMed, color: colors.accent, width: 60 },
  title: { ...type.h2, color: colors.text },
  qrCard: {
    alignSelf: 'center',
    padding: space.x5,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 236,
    minHeight: 236,
    ...shadow.card,
  },
  qrEmpty: {
    ...type.caption,
    color: colors.textFaint,
    textAlign: 'center',
    fontFamily: font.body,
  },
  hint: {
    ...type.caption,
    textAlign: 'center',
    marginTop: space.x4,
    paddingHorizontal: space.x4,
  },
  form: { marginTop: space.x6 },
});
