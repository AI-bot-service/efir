import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radius, space, font } from '../theme/tokens';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function Toggle({ value, onChange, title, subtitle, icon }: Props) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={styles.row}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.x4,
    gap: space.x3,
  },
  icon: { width: 24, alignItems: 'center' },
  texts: { flex: 1 },
  title: { fontFamily: font.medium, fontSize: 15, color: colors.text },
  subtitle: { fontFamily: font.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  track: {
    width: 50,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
  },
  knobOn: { backgroundColor: colors.onAccent, alignSelf: 'flex-end' },
});
