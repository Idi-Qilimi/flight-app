import { makeStore } from '../store';
import { hydrated } from '../store/actions';
import {
  selectCurrentUser,
  selectFavoritesByFlightId,
  selectIsHydrated,
  selectIsLoggedIn,
  selectThemePreference,
} from '../store/selectors';
import { loggedOut } from '../store/slices/authSlice';
import searchFormReducer, {
  airportsSwapped,
  createInitialSearchForm,
  departureDateChanged,
  prefilled,
} from '../store/slices/searchFormSlice';
import themeReducer, { resolveColorScheme, themePreferenceChanged } from '../store/slices/themeSlice';
import { sampleFlight } from '../test-utils';
import type { FavoriteFlight, User } from '../types/models';

const user: User = {
  id: '1',
  email: 'demo@flightapp.dev',
  username: 'demo',
  name: 'Demo Traveler',
  createdAt: '2026-01-15T09:00:00.000Z',
};

describe('searchFormSlice', () => {
  const initial = createInitialSearchForm('2026-10-01');

  it('starts one week out with TIA → FCO', () => {
    expect(initial).toEqual({ origin: 'TIA', destination: 'FCO', departureDate: '2026-10-08', returnDate: '2026-10-11' });
  });

  it('swaps origin and destination', () => {
    const state = searchFormReducer(initial, airportsSwapped());
    expect(state.origin).toBe('FCO');
    expect(state.destination).toBe('TIA');
  });

  it('pushes the return date forward when departure moves past it', () => {
    const state = searchFormReducer(initial, departureDateChanged('2026-10-20'));
    expect(state.returnDate).toBe('2026-10-20');
  });

  it('prefills every field from a recent search', () => {
    const recent = { origin: 'ATH', destination: 'MUC', departureDate: '2026-11-01', returnDate: '2026-11-04' };
    expect(searchFormReducer(initial, prefilled(recent))).toEqual(recent);
  });
});

describe('themeSlice', () => {
  it('defaults to following the system', () => {
    expect(themeReducer(undefined, { type: '@@init' }).preference).toBe('system');
  });

  it('stores an explicit preference', () => {
    expect(themeReducer(undefined, themePreferenceChanged('dark')).preference).toBe('dark');
  });

  it.each([
    ['system', 'dark', 'dark'],
    ['system', null, 'light'],
    ['light', 'dark', 'light'],
    ['dark', 'light', 'dark'],
  ] as const)('resolves %s + system %s → %s', (preference, system, expected) => {
    expect(resolveColorScheme(preference, system)).toBe(expected);
  });
});

describe('root store & selectors', () => {
  it('hydrates the persisted session and theme', () => {
    const store = makeStore();
    expect(selectIsHydrated(store.getState())).toBe(false);
    store.dispatch(hydrated({ user, themePreference: 'dark' }));
    const state = store.getState();
    expect(selectIsHydrated(state)).toBe(true);
    expect(selectIsLoggedIn(state)).toBe(true);
    expect(selectCurrentUser(state)).toEqual(user);
    expect(selectThemePreference(state)).toBe('dark');
  });

  it('clears user state on logout but keeps the theme choice', () => {
    const store = makeStore();
    store.dispatch(hydrated({ user, themePreference: 'dark' }));
    store.dispatch(prefilled({ origin: 'ATH', destination: 'MUC', departureDate: '2026-11-01', returnDate: '2026-11-04' }));
    store.dispatch(loggedOut());
    const state = store.getState();
    expect(selectIsLoggedIn(state)).toBe(false);
    expect(selectIsHydrated(state)).toBe(true);
    expect(selectThemePreference(state)).toBe('dark');
    expect(state.searchForm.origin).toBe('TIA');
  });

  it('indexes favorites by flight id', () => {
    const favorite: FavoriteFlight = {
      id: 'f1',
      userId: '1',
      flightId: sampleFlight.id,
      flight: sampleFlight,
      createdAt: '2026-10-01T00:00:00.000Z',
    };
    const map = selectFavoritesByFlightId([favorite]);
    expect(map.get(sampleFlight.id)).toBe(favorite);
    expect(selectFavoritesByFlightId(undefined).size).toBe(0);
  });
});
