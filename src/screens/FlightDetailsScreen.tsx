import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect, type ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGetFlightQuery } from '../api/api';
import EmptyState from '../components/EmptyState';
import FavoriteButton from '../components/FavoriteButton';
import StatusBadge from '../components/StatusBadge';
import { getAirport } from '../data/airports';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFavorites } from '../hooks/useFavorites';
import type { FlightDetailsScreenProps } from '../navigation/types';
import { radius, spacing } from '../theme/theme';
import { addMinutes, formatDuration, formatLongDate, formatTime } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';

function InfoTile({ icon, label, value }: { icon: ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.tileLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.tileValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export default function FlightDetailsScreen({ route, navigation }: FlightDetailsScreenProps) {
  const { flightId } = route.params;
  const { colors } = useAppTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const query = useGetFlightQuery(flightId);
  // Fall back to the saved snapshot so favorites still open if regeneration fails.
  const flight = query.data ?? favorites.find((f) => f.flightId === flightId)?.flight;
  const favorite = isFavorite(flightId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: flight ? flight.flightNumber : 'Flight details',
      headerRight: flight
        ? () => <FavoriteButton testID="details-favorite" active={favorite} onPress={() => toggleFavorite(flight)} />
        : undefined,
    });
  }, [navigation, flight, favorite, toggleFavorite]);

  if (!flight) {
    if (query.isLoading) return <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />;
    return <EmptyState icon="airplane-outline" title="Flight not found" message={getErrorMessage(query.error)} />;
  }

  const origin = getAirport(flight.origin);
  const destination = getAirport(flight.destination);
  const boarding = addMinutes(flight.departureTime, -40);

  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroTop}>
          <Text style={[styles.heroAirline, { color: colors.onPrimary }]}>
            {flight.airline.name} · {flight.flightNumber}
          </Text>
          <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
            <StatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
          </View>
        </View>

        <View style={styles.route}>
          <View style={styles.endpoint}>
            <Text style={[styles.code, { color: colors.onPrimary }]}>{flight.origin}</Text>
            <Text style={[styles.city, { color: colors.onPrimary }]} numberOfLines={1}>
              {origin?.city}
            </Text>
          </View>
          <View style={styles.flightPath}>
            <Ionicons name="airplane" size={22} color={colors.onPrimary} />
            <Text style={[styles.duration, { color: colors.onPrimary }]}>{formatDuration(flight.durationMinutes)}</Text>
          </View>
          <View style={[styles.endpoint, styles.alignEnd]}>
            <Text style={[styles.code, { color: colors.onPrimary }]}>{flight.destination}</Text>
            <Text style={[styles.city, { color: colors.onPrimary }]} numberOfLines={1}>
              {destination?.city}
            </Text>
          </View>
        </View>

        <View style={styles.route}>
          <View>
            <Text style={[styles.heroLabel, { color: colors.onPrimary }]}>Departs</Text>
            <Text style={[styles.heroTime, { color: colors.onPrimary }]}>{formatTime(flight.departureTime)}</Text>
            <Text style={[styles.heroDate, { color: colors.onPrimary }]}>
              {formatLongDate(flight.departureTime.slice(0, 10))}
            </Text>
          </View>
          <View style={styles.alignEnd}>
            <Text style={[styles.heroLabel, { color: colors.onPrimary }]}>Arrives</Text>
            <Text style={[styles.heroTime, { color: colors.onPrimary }]}>{formatTime(flight.arrivalTime)}</Text>
            <Text style={[styles.heroDate, { color: colors.onPrimary }]}>
              {formatLongDate(flight.arrivalTime.slice(0, 10))}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Flight information</Text>
      <View style={styles.grid}>
        <InfoTile icon="log-in-outline" label="Terminal" value={flight.terminal} />
        <InfoTile icon="enter-outline" label="Gate" value={flight.gate} />
        <InfoTile icon="time-outline" label="Boarding" value={formatTime(boarding)} />
        <InfoTile icon="airplane-outline" label="Aircraft" value={flight.aircraft} />
        <InfoTile icon="people-outline" label="Seats left" value={String(flight.seatsLeft)} />
        <InfoTile icon="pricetag-outline" label="Price" value={`€${flight.price}`} />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Airports</Text>
      <View style={[styles.airports, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[origin, destination].map((a, i) =>
          a ? (
            <View key={a.code} style={styles.airportRow}>
              <Ionicons name={i === 0 ? 'radio-button-on' : 'location'} size={18} color={colors.primary} />
              <View style={styles.flex}>
                <Text style={[styles.airportName, { color: colors.text }]}>{a.name}</Text>
                <Text style={[styles.airportMeta, { color: colors.muted }]}>
                  {a.code} · {a.city}, {a.country}
                </Text>
              </View>
            </View>
          ) : null,
        )}
      </View>
      <Text style={[styles.disclaimer, { color: colors.muted }]}>
        Times are shown in local airport time. Demo data – not for real travel.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { borderRadius: radius.lg + 4, padding: spacing.xl, gap: spacing.xl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  heroAirline: { fontSize: 15, fontWeight: '600', flex: 1, opacity: 0.95 },
  heroBadge: { borderRadius: 999, padding: 2 },
  route: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  endpoint: { flex: 1 },
  alignEnd: { alignItems: 'flex-end' },
  code: { fontSize: 34, fontWeight: '800', letterSpacing: 1 },
  city: { fontSize: 14, opacity: 0.85 },
  flightPath: { alignItems: 'center', paddingHorizontal: spacing.md },
  duration: { fontSize: 12, marginTop: 4, opacity: 0.9 },
  heroLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8 },
  heroTime: { fontSize: 26, fontWeight: '700', fontVariant: ['tabular-nums'] },
  heroDate: { fontSize: 13, opacity: 0.85 },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.xl, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    flexBasis: '30%',
    flexGrow: 1,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: 4,
  },
  tileLabel: { fontSize: 12 },
  tileValue: { fontSize: 15, fontWeight: '700' },
  airports: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.lg },
  airportRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  airportName: { fontSize: 15, fontWeight: '600' },
  airportMeta: { fontSize: 13, marginTop: 2 },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: spacing.xl },
});
