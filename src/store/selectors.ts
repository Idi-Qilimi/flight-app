import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { FavoriteFlight } from '../types/models';

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsHydrated = (state: RootState) => state.auth.hydrated;
export const selectIsLoggedIn = (state: RootState) => state.auth.user !== null;
export const selectThemePreference = (state: RootState) => state.theme.preference;
export const selectSearchForm = (state: RootState) => state.searchForm;

/** flightId → favorite record, for O(1) "is this a favorite?" lookups. */
export const selectFavoritesByFlightId = createSelector(
  [(favorites: FavoriteFlight[] | undefined) => favorites],
  (favorites) => new Map((favorites ?? []).map((f) => [f.flightId, f])),
);
