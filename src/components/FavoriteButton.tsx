import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface FavoriteButtonProps {
  active: boolean;
  onPress: () => void;
  size?: number;
  testID?: string;
}

/** Heart toggle with a small "pop" animation when it becomes active. */
export default function FavoriteButton({ active, onPress, size = 24, testID }: FavoriteButtonProps) {
  const { colors } = useAppTheme();
  const [scale] = useState(() => new Animated.Value(1));
  const previous = useRef(active);

  useEffect(() => {
    if (active && !previous.current) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 50, bounciness: 12 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
      ]).start();
    }
    previous.current = active;
  }, [active, scale]);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: active }}
      style={styles.button}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={size} color={active ? colors.favorite : colors.muted} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4 },
});
