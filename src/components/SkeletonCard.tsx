import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing } from '../theme/theme';

/** Pulsing placeholder shown while flight results load. */
export default function SkeletonCard() {
  const { colors } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const bar = (width: number | `${number}%`, height = 12) => (
    <View style={{ width, height, borderRadius: 6, backgroundColor: colors.surfaceAlt }} />
  );

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity }]}>
      <View style={styles.row}>
        <View style={[styles.logo, { backgroundColor: colors.surfaceAlt }]} />
        <View style={styles.text}>
          {bar('60%')}
          {bar('30%')}
        </View>
      </View>
      <View style={styles.between}>
        {bar(64, 24)}
        {bar(80, 10)}
        {bar(64, 24)}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: radius.sm },
  text: { flex: 1, gap: spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
