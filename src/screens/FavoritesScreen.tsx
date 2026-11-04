import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, LayoutAnimation, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FlightCard from '../components/FlightCard';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFavorites } from '../hooks/useFavorites';
import type { FavoritesScreenProps } from '../navigation/types';
import { radius, spacing } from '../theme/theme';
import type { Flight } from '../types/models';
import { getErrorMessage } from '../utils/errors';

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { colors } = useAppTheme();
  const { favorites, isLoading, isFetching, isError, error, refetch, toggleFavorite } = useFavorites();

  const openDetails = useCallback(
    (flight: Flight) => navigation.navigate('FlightDetails', { flightId: flight.id }),
    [navigation],
  );

  const remove = useCallback(
    (flight: Flight) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(flight);
    },
    [toggleFavorite],
  );

  if (isLoading) return <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />;

  if (isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load favorites"
        message={getErrorMessage(error)}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(f) => f.id}
      contentContainerStyle={[styles.content, favorites.length === 0 && styles.grow]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => void refetch()} tintColor={colors.primary} colors={[colors.primary]} />
      }
      ListHeaderComponent={
        favorites.length > 0 ? (
          <Text style={[styles.count, { color: colors.muted }]}>
            {favorites.length} saved {favorites.length === 1 ? 'flight' : 'flights'}
          </Text>
        ) : undefined
      }
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="No favorite flights yet"
          message="Tap the heart on any flight in your search results to save it here."
          actionLabel="Search flights"
          onAction={() => navigation.navigate('HomeTab', { screen: 'Home' })}
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      renderItem={({ item }) => (
        <View>
          <FlightCard flight={item.flight} isFavorite onPress={openDetails} onToggleFavorite={remove} showDate />
          <Pressable
            testID={`remove-favorite-${item.flightId}`}
            onPress={() => remove(item.flight)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.flight.flightNumber} from favorites`}
            style={({ pressed }) => [
              styles.remove,
              { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
            ]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  grow: { flexGrow: 1, justifyContent: 'center' },
  count: { fontSize: 14, marginBottom: spacing.md },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  removeText: { fontSize: 13, fontWeight: '600' },
});
