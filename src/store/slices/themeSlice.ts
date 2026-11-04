import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ColorScheme, ThemePreference } from '../../types/models';
import { hydrated } from '../actions';

export interface ThemeState {
  preference: ThemePreference;
}

/** Respects the system theme until the user picks one explicitly. */
const initialState: ThemeState = { preference: 'system' };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themePreferenceChanged: (state, action: PayloadAction<ThemePreference>) => {
      state.preference = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state, action) => {
      if (action.payload.themePreference) state.preference = action.payload.themePreference;
    });
  },
});

/** Pure resolution of the effective scheme – the OS value is passed in. */
export function resolveColorScheme(
  preference: ThemePreference,
  system: ColorScheme | null | undefined | 'unspecified',
): ColorScheme {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

export const { themePreferenceChanged } = themeSlice.actions;
export default themeSlice.reducer;
