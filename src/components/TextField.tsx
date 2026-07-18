import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, radius, space, font, type } from '../theme/tokens';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  mono?: boolean;
  right?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function TextField({
  label,
  hint,
  mono,
  right,
  containerStyle,
  ...input
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.eyebrow}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          {...input}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[
            styles.input,
            mono && { fontFamily: font.monoBold, letterSpacing: 2 },
          ]}
        />
        {right}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...type.eyebrow,
    color: colors.textMuted,
    marginBottom: space.x2,
    textTransform: 'uppercase',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.x4,
  },
  fieldFocused: { borderColor: colors.accent },
  input: {
    flex: 1,
    height: 54,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 16,
  },
  hint: {
    ...type.caption,
    marginTop: space.x2,
  },
});
