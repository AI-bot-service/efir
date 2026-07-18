import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

interface Props {
  bars?: number;
  color?: string;
  height?: number;
  active?: boolean;
}

/** Живой эквалайзер — намёк на «звук в эфире». */
export function WaveBars({ bars = 5, color = colors.accent, height = 22, active = true }: Props) {
  const vals = useRef(Array.from({ length: bars }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = vals.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.25, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ]),
      ),
    );
    if (active) loops.forEach((l) => l.start());
    else vals.forEach((v) => v.setValue(0.3));
    return () => loops.forEach((l) => l.stop());
  }, [active, vals]);

  return (
    <View style={[styles.row, { height }]}>
      {vals.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: v.interpolate({ inputRange: [0, 1], outputRange: [3, height] }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bar: { width: 3, borderRadius: radius.pill },
});
