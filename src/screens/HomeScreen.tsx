import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Screen, Button, TextField, SignalRing, WaveBars } from '../components';
import { colors, space, type, font, radius } from '../theme/tokens';
import {
  useAppStore,
  generateRoomName,
  sanitizeRoom,
  DEFAULT_ROOM,
  type RecentRoom,
} from '../store/useAppStore';

export function HomeScreen() {
  const { displayName, recentRooms, joinRoom, removeRecent, navigate } = useAppStore();
  const [code, setCode] = useState('');

  // Главное действие — постоянная комната группы; случайная остаётся запасным.
  const enterHome = () => joinRoom(DEFAULT_ROOM || generateRoomName());
  const startNew = () => joinRoom(generateRoomName());
  const joinByCode = () => {
    const room = sanitizeRoom(code);
    if (room) joinRoom(room);
  };

  const greeting = displayName ? `На связи, ${displayName}` : 'На связи';

  return (
    <Screen scroll>
      {/* header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <WaveBars bars={4} height={16} />
            <Text style={styles.brand}>ЭФИР</Text>
          </View>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
        <Pressable
          onPress={() => navigate('settings')}
          accessibilityLabel="Настройки"
          style={styles.gear}>
          <Text style={styles.gearGlyph}>☰</Text>
        </Pressable>
      </View>

      {/* hero — сигнатура: радио-волны + старт */}
      <View style={styles.hero}>
        <SignalRing size={260} active>
          <Pressable
            onPress={enterHome}
            accessibilityRole="button"
            accessibilityLabel={DEFAULT_ROOM ? `Войти в комнату ${DEFAULT_ROOM}` : 'Начать эфир'}
            style={({ pressed }) => [styles.startBtn, pressed && styles.startPressed]}>
            <Text style={styles.startPulse}>●</Text>
            <Text style={styles.startLabel}>
              {DEFAULT_ROOM ? `Войти\nв эфир` : `Начать\nэфир`}
            </Text>
          </Pressable>
        </SignalRing>
        {DEFAULT_ROOM ? <Text style={styles.roomTag}>{DEFAULT_ROOM}</Text> : null}
      </View>

      {/* join by code — «настроить частоту» */}
      <View style={styles.joinBlock}>
        <TextField
          label="Код комнаты"
          mono
          placeholder="tihiy-signal-421"
          autoCapitalize="none"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
          onSubmitEditing={joinByCode}
          returnKeyType="go"
        />
        <Button
          label="Подключиться"
          variant="secondary"
          onPress={joinByCode}
          disabled={!sanitizeRoom(code)}
          style={{ marginTop: space.x3 }}
        />
        <Button
          label="Новая разовая комната"
          variant="ghost"
          onPress={startNew}
          style={{ marginTop: space.x2 }}
        />
        <Button
          label="Пригласить собеседника"
          variant="ghost"
          onPress={() => navigate('invite')}
        />
      </View>

      {/* recent */}
      {recentRooms.length > 0 && (
        <View style={styles.recent}>
          <Text style={styles.recentTitle}>Недавние частоты</Text>
          <FlatList
            scrollEnabled={false}
            data={recentRooms}
            keyExtractor={(r) => r.name}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <RecentItem item={item} onJoin={() => joinRoom(item.name)} onRemove={() => removeRecent(item.name)} />
            )}
          />
        </View>
      )}
    </Screen>
  );
}

function RecentItem({ item, onJoin, onRemove }: { item: RecentRoom; onJoin: () => void; onRemove: () => void }) {
  return (
    <View style={styles.recentRow}>
      <Pressable style={styles.recentMain} onPress={onJoin} accessibilityLabel={`Войти в ${item.name}`}>
        <View style={styles.dot} />
        <Text style={styles.recentName} numberOfLines={1}>
          {item.name}
        </Text>
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel="Убрать из недавних">
        <Text style={styles.recentX}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: space.x4,
    marginBottom: space.x6,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.x2 },
  brand: { fontFamily: font.monoBold, fontSize: 15, color: colors.accent, letterSpacing: 6 },
  greeting: { ...type.h1, color: colors.text, marginTop: space.x2 },
  gear: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearGlyph: { color: colors.text, fontSize: 18 },

  hero: { alignItems: 'center', marginVertical: space.x6 },
  roomTag: {
    ...type.callsign,
    fontSize: 15,
    letterSpacing: 3,
    color: colors.textMuted,
    marginTop: space.x4,
  },
  startBtn: {
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 14,
  },
  startPressed: { transform: [{ scale: 0.96 }] },
  startPulse: { color: colors.onAccent, fontSize: 12, marginBottom: 4 },
  startLabel: {
    color: colors.onAccent,
    fontFamily: font.displayBold,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 22,
  },

  joinBlock: { marginTop: space.x4 },

  recent: { marginTop: space.x8 },
  recentTitle: { ...type.eyebrow, color: colors.textMuted, textTransform: 'uppercase', marginBottom: space.x3 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.x3 },
  recentMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.x3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  recentName: { fontFamily: font.mono, fontSize: 15, color: colors.text, flex: 1 },
  recentX: { color: colors.textFaint, fontSize: 16, paddingHorizontal: space.x2 },
  sep: { height: 1, backgroundColor: colors.border },
});
