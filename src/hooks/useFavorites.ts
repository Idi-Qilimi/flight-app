import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { skipToken } from '@reduxjs/toolkit/query';
import type { Flight } from '../types/models';
import { useAddFavoriteMutation, useGetFavoritesQuery, useRemoveFavoriteMutation } from '../api/api';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectFavoritesByFlightId } from '../store/selectors';
import { getErrorMessage } from '../utils/errors';

/** Favorites for the signed-in user plus an optimistic toggle. */
export function useFavorites() {
  const user = useAppSelector(selectCurrentUser);
  const query = useGetFavoritesQuery(user?.id ?? skipToken);
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const byFlightId = useMemo(() => selectFavoritesByFlightId(query.data), [query.data]);

  const isFavorite = useCallback((flightId: string) => byFlightId.has(flightId), [byFlightId]);

  const toggleFavorite = useCallback(
    async (flight: Flight) => {
      if (!user) return;
      const existing = byFlightId.get(flight.id);
      try {
        if (existing) {
          // Temp ids only exist while the POST is in flight – nothing to delete yet.
          if (existing.id.startsWith('temp-')) return;
          await removeFavorite({ userId: user.id, favoriteId: existing.id }).unwrap();
        } else {
          await addFavorite({ userId: user.id, flight }).unwrap();
        }
      } catch (error) {
        Alert.alert('Could not update favorites', getErrorMessage(error));
      }
    },
    [user, byFlightId, addFavorite, removeFavorite],
  );

  return { ...query, favorites: query.data ?? [], isFavorite, toggleFavorite };
}
