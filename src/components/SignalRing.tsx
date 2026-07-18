import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

interface Props {
  size?: number;
  color?: string;
  active?: boolean; // «в эфире» — пульсация волн
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Сигнатура Efir: концентрические радио-волны, расходящиеся от центра.
 * По центру — контент (кнопка/иконка). При active пульсирует непрерывно.
 */
export function SignalRing({
  size = 220,
  color = colors.accent,
  active = true,
  children,
  style,
}: Props) {
  const waves = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const loops = waves.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 900),
          Animated.timing(v, {
            toValue: 1,
            duration: 2700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    if (active) loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, waves]);

  return (
    <View style={[{ width: size, height: size }, styles.wrap, style]}>
      {waves.map((v, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.wave,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.5, 0] }),
              transform: [
                { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.15] }) },
              ],
            },
          ]}
        />
      ))}
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  wave: { position: 'absolute', borderWidth: 2 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
