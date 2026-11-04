import { createApi, fetchBaseQuery, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type {
  FavoriteFlight,
  Flight,
  RecentSearch,
  SearchParams,
  SearchResults,
  User,
  UserRecord,
} from '../types/models';
import { getFlightById, searchFlights } from '../services/flightGenerator';
import { applyRecentSearchRules } from '../utils/search';
import { API_URL, MOCK_LATENCY_MS } from './config';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const customError = (message: string): FetchBaseQueryError => ({ status: 'CUSTOM_ERROR', error: message });

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

const stripPassword = ({ password: _password, ...user }: UserRecord): User => user;

/**
 * Single RTK Query API slice:
 *  - users / favorites / recentSearches are persisted in json-server
 *  - flights come from the deterministic mock provider (queryFn)
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL, timeout: 10_000 }),
  tagTypes: ['Favorites', 'RecentSearches', 'Flights'],
  endpoints: (build) => ({
    /* ---------------------------------- auth --------------------------------- */
    login: build.mutation<User, LoginRequest>({
      async queryFn({ identifier, password }, _api, _extra, baseQuery) {
        const id = identifier.trim().toLowerCase();
        const field = id.includes('@') ? 'email' : 'username';
        const result = await baseQuery({ url: 'users', params: { [field]: id } });
        if (result.error) return { error: result.error };

        const user = (result.data as UserRecord[])[0];
        // Mock auth: plain-text comparison against the seeded json-server record.
        if (!user || user.password !== password) {
          return { error: customError('Incorrect email/username or password') };
        }
        return { data: stripPassword(user) };
      },
    }),

    /* -------------------------------- flights -------------------------------- */
    searchFlights: build.query<SearchResults, SearchParams>({
      async queryFn(params) {
        await delay(MOCK_LATENCY_MS);
        return { data: searchFlights(params) };
      },
      providesTags: ['Flights'],
    }),

    getFlight: build.query<Flight, string>({
      async queryFn(flightId) {
        await delay(MOCK_LATENCY_MS / 2);
        const flight = getFlightById(flightId);
        return flight ? { data: flight } : { error: customError('Flight not found') };
      },
    }),

    /* ---------------------------- recent searches ---------------------------- */
    getRecentSearches: build.query<RecentSearch[], string>({
      query: (userId) => ({ url: 'recentSearches', params: { userId, _sort: '-createdAt' } }),
      transformResponse: (items: RecentSearch[]) => applyRecentSearchRules(items).keep,
      providesTags: ['RecentSearches'],
    }),

    addRecentSearch: build.mutation<RecentSearch, { userId: string; search: SearchParams }>({
      async queryFn({ userId, search }, _api, _extra, baseQuery) {
        const created = await baseQuery({
          url: 'recentSearches',
          method: 'POST',
          body: { ...search, userId, createdAt: new Date().toISOString() },
        });
        if (created.error) return { error: created.error };

        // Enforce "newest first, no duplicates, last 10" on the server too.
        const all = await baseQuery({ url: 'recentSearches', params: { userId } });
        if (!all.error) {
          const { remove } = applyRecentSearchRules(all.data as RecentSearch[]);
          await Promise.all(remove.map((id) => baseQuery({ url: `recentSearches/${id}`, method: 'DELETE' })));
        }
        return { data: created.data as RecentSearch };
      },
      async onQueryStarted({ userId, search }, { dispatch, queryFulfilled }) {
        // Optimistically show the search at the top of the list.
        const patch = dispatch(
          api.util.updateQueryData('getRecentSearches', userId, (draft) => {
            const optimistic: RecentSearch = {
              ...search,
              id: `temp-${Date.now()}`,
              userId,
              createdAt: new Date().toISOString(),
            };
            return applyRecentSearchRules([optimistic, ...draft]).keep;
          }),
        );
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: ['RecentSearches'],
    }),

    clearRecentSearches: build.mutation<null, { userId: string; ids: string[] }>({
      async queryFn({ ids }, _api, _extra, baseQuery) {
        const results = await Promise.all(
          ids.map((id) => baseQuery({ url: `recentSearches/${id}`, method: 'DELETE' })),
        );
        const failed = results.find((r) => r.error);
        return failed?.error ? { error: failed.error } : { data: null };
      },
      invalidatesTags: ['RecentSearches'],
    }),

    /* ------------------------------- favorites ------------------------------- */
    getFavorites: build.query<FavoriteFlight[], string>({
      query: (userId) => ({ url: 'favorites', params: { userId, _sort: '-createdAt' } }),
      providesTags: ['Favorites'],
    }),

    addFavorite: build.mutation<FavoriteFlight, { userId: string; flight: Flight }>({
      query: ({ userId, flight }) => ({
        url: 'favorites',
        method: 'POST',
        body: { userId, flightId: flight.id, flight, createdAt: new Date().toISOString() },
      }),
      async onQueryStarted({ userId, flight }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getFavorites', userId, (draft) => {
            draft.unshift({
              id: `temp-${flight.id}`,
              userId,
              flightId: flight.id,
              flight,
              createdAt: new Date().toISOString(),
            });
          }),
        );
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: ['Favorites'],
    }),

    removeFavorite: build.mutation<null, { userId: string; favoriteId: string }>({
      query: ({ favoriteId }) => ({ url: `favorites/${favoriteId}`, method: 'DELETE' }),
      async onQueryStarted({ userId, favoriteId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getFavorites', userId, (draft) =>
            draft.filter((f) => f.id !== favoriteId),
          ),
        );
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSearchFlightsQuery,
  useGetFlightQuery,
  useGetRecentSearchesQuery,
  useAddRecentSearchMutation,
  useClearRecentSearchesMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = api;
