import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RecentSearch } from '../types/models';
import { useAppTheme } from '../hooks/useAppTheme';
import { getAirport } from '../data/airports';
import { radius, spacing } from '../theme/theme';
import { formatSearchLabel } from '../utils/search';

interface RecentSearchItemProps {
  search: RecentSearch;
  onPress: (search: RecentSearch) => void;
}

export default function RecentSearchItem({ search, onPress }: RecentSearchItemProps) {
  const { colors } = useAppTheme();
  const cities = `${getAirport(search.origin)?.city ?? search.origin} to ${getAirport(search.destination)?.city ?? search.destination}`;

  return (
    <Pressable
      testID={`recent-${search.id}`}
      accessibilityRole="button"
      accessibilityHint="Fills the search form with this search"
      onPress={() => onPress(search)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceAlt : colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="time-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.text }]}>{formatSearchLabel(search)}</Text>
        <Text style={[styles.sub, { color: colors.muted }]} numberOfLines={1}>
          {cities}
        </Text>
      </View>
      <Ionicons name="arrow-up-outline" size={18} color={colors.muted} style={styles.fillIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  fillIcon: { transform: [{ rotate: '-45deg' }] },
});
