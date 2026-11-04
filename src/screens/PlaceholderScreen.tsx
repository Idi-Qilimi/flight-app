import { View, StyleSheet } from 'react-native';
import EmptyState from '../components/EmptyState';
import type { PlaceholderScreenProps } from '../navigation/types';
import { MORE_ITEMS } from './MoreScreen';

/** Intentionally empty sub-page for the More menu (Settings, Help, About, Contact). */
export default function PlaceholderScreen({ route }: PlaceholderScreenProps) {
  const item = MORE_ITEMS.find((i) => i.route === route.name);
  return (
    <View style={styles.container}>
      <EmptyState
        icon={item?.icon ?? 'construct-outline'}
        title={item?.label ?? route.name}
        message="This screen is a placeholder and intentionally left empty."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
});
