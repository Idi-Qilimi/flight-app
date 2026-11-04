import { useCallback, useLayoutEffect, useMemo } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSearchFlightsQuery } from '../api/api';
import EmptyState from '../components/EmptyState';
import FlightCard from '../components/FlightCard';
import SkeletonCard from '../components/SkeletonCard';
import { getAirport } from '../data/airports';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFavorites } from '../hooks/useFavorites';
import type { SearchResultsScreenProps } from '../navigation/types';
import { spacing } from '../theme/theme';
import type { Flight } from '../types/models';
import { formatLongDate } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';

interface Section {
  key: 'outbound' | 'inbound';
  title: string;
  subtitle: string;
  data: Flight[];
}

export default function SearchResultsScreen({ route, navigation }: SearchResultsScreenProps) {
  const params = route.params;
  const { colors } = useAppTheme();
  const { data, isLoading, isFetching, isError, error, refetch } = useSearchFlightsQuery(params);
  const { isFavorite, toggleFavorite } = useFavorites();

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${params.origin} → ${params.destination}` });
  }, [navigation, params.origin, params.destination]);

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    const city = (code: string) => getAirport(code)?.city ?? code;
    return [
      {
        key: 'outbound',
        title: `Outbound · ${city(params.origin)} → ${city(params.destination)}`,
        subtitle: `${formatLongDate(params.departureDate)} · ${data.outbound.length} flights`,
        data: data.outbound,
      },
      {
        key: 'inbound',
        title: `Return · ${city(params.destination)} → ${city(params.origin)}`,
        subtitle: `${formatLongDate(params.returnDate)} · ${data.inbound.length} flights`,
        data: data.inbound,
      },
    ];
  }, [data, params]);

  const openDetails = useCallback(
    (flight: Flight) => navigation.navigate('FlightDetails', { flightId: flight.id }),
    [navigation],
  );

  if (isLoading) {
    return (
      <View style={styles.content} testID="results-loading">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load flights"
        message={getErrorMessage(error)}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(f) => f.id}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={() => void refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{section.subtitle}</Text>
          {section.data.length === 0 ? (
            <Text style={[styles.none, { color: colors.muted }]}>No flights on this day.</Text>
          ) : null}
        </View>
      )}
      renderItem={({ item }) => (
        <FlightCard
          flight={item}
          isFavorite={isFavorite(item.id)}
          onPress={openDetails}
          onToggleFavorite={toggleFavorite}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionHeader: { marginTop: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13, marginTop: 2 },
  none: { fontSize: 14, marginTop: spacing.md },
});
