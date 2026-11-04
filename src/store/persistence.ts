import AsyncStorage from '@react-native-async-storage/async-storage';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { ThemePreference, User } from '../types/models';
import { api } from '../api/api';
import { loggedOut } from './slices/authSlice';
import { themePreferenceChanged } from './slices/themeSlice';

/**
 * Device-local persistence. Only the session pointer and the theme choice
 * live on the device; user data (favorites, recent searches, profile) lives
 * in json-server.
 */
const KEYS = {
  session: 'flight-app/session',
  theme: 'flight-app/theme',
} as const;

const THEME_VALUES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export async function loadPersistedState(): Promise<{
  user: User | null;
  themePreference: ThemePreference | null;
}> {
  try {
    const [[, session], [, theme]] = await AsyncStorage.multiGet([KEYS.session, KEYS.theme]);
    const user = session ? (JSON.parse(session) as User) : null;
    const themePreference = THEME_VALUES.includes(theme as ThemePreference) ? (theme as ThemePreference) : null;
    return { user, themePreference };
  } catch {
    return { user: null, themePreference: null };
  }
}

export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: api.endpoints.login.matchFulfilled,
  effect: async (action) => {
    await AsyncStorage.setItem(KEYS.session, JSON.stringify(action.payload));
  },
});

persistenceMiddleware.startListening({
  actionCreator: loggedOut,
  effect: async () => {
    await AsyncStorage.removeItem(KEYS.session);
  },
});

persistenceMiddleware.startListening({
  actionCreator: themePreferenceChanged,
  effect: async (action) => {
    await AsyncStorage.setItem(KEYS.theme, action.payload);
  },
});
