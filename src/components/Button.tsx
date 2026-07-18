import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, space, font, shadow } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        variantStyle[variant],
        isPrimary && shadow.glow,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}>
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? colors.onAccent : colors.text} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, labelStyle[variant]]}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.x6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.x2 },
  label: { fontFamily: font.semibold, fontSize: 16, letterSpacing: 0.2 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  disabled: { opacity: 0.45 },
});

const variantStyle: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
};

const labelStyle: Record<Variant, { color: string }> = {
  primary: { color: colors.onAccent },
  secondary: { color: colors.text },
  ghost: { color: colors.textMuted },
  danger: { color: '#fff' },
};
