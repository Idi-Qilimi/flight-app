import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Flight } from '../types/models';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing } from '../theme/theme';
import { dayOffset, formatDuration, formatShortDate, formatTime } from '../utils/dates';
import FavoriteButton from './FavoriteButton';
import StatusBadge from './StatusBadge';

interface FlightCardProps {
  flight: Flight;
  isFavorite: boolean;
  onPress: (flight: Flight) => void;
  onToggleFavorite: (flight: Flight) => void;
  showDate?: boolean;
}

function FlightCard({ flight, isFavorite, onPress, onToggleFavorite, showDate = false }: FlightCardProps) {
  const { colors } = useAppTheme();
  const nextDay = dayOffset(flight.departureTime, flight.arrivalTime);

  return (
    <Pressable
      testID={`flight-card-${flight.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Flight ${flight.flightNumber} by ${flight.airline.name}, departs ${formatTime(flight.departureTime)}, arrives ${formatTime(flight.arrivalTime)}`}
      onPress={() => onPress(flight)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.airlineLogo, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.airlineCode, { color: colors.primary }]}>{flight.airline.code}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.airline, { color: colors.text }]} numberOfLines={1}>
            {flight.airline.name}
          </Text>
          <Text style={[styles.meta, { color: colors.muted }]}>
            {flight.flightNumber}
            {showDate ? ` · ${formatShortDate(flight.departureTime.slice(0, 10))}` : ''}
          </Text>
        </View>
        <FavoriteButton
          testID={`favorite-${flight.id}`}
          active={isFavorite}
          onPress={() => onToggleFavorite(flight)}
        />
      </View>

      <View style={styles.timesRow}>
        <View>
          <Text style={[styles.time, { color: colors.text }]}>{formatTime(flight.departureTime)}</Text>
          <Text style={[styles.code, { color: colors.muted }]}>{flight.origin}</Text>
        </View>
        <View style={styles.middle}>
          <Text style={[styles.duration, { color: colors.muted }]}>{formatDuration(flight.durationMinutes)}</Text>
          <View style={styles.lineRow}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Ionicons name="airplane" size={14} color={colors.primary} />
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>
          <Text style={[styles.duration, { color: colors.muted }]}>Direct</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={[styles.time, { color: colors.text }]}>
            {formatTime(flight.arrivalTime)}
            {nextDay > 0 ? <Text style={[styles.plus, { color: colors.warning }]}> +{nextDay}</Text> : null}
          </Text>
          <Text style={[styles.code, { color: colors.muted }]}>{flight.destination}</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <StatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
        <Text style={[styles.price, { color: colors.text }]}>
          €{flight.price}
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(FlightCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  airlineLogo: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  airlineCode: { fontWeight: '800', fontSize: 14 },
  headerText: { flex: 1 },
  airline: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 2 },
  timesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  plus: { fontSize: 12, fontWeight: '700' },
  code: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  middle: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.md },
  lineRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 4, marginVertical: 2 },
  line: { flex: 1, height: 1 },
  duration: { fontSize: 12 },
  alignEnd: { alignItems: 'flex-end' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  price: { fontSize: 17, fontWeight: '700' },
});
