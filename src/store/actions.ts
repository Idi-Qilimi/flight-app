import { createAction } from '@reduxjs/toolkit';
import type { ThemePreference, User } from '../types/models';

/** Dispatched once at startup after reading the persisted session & preferences. */
export const hydrated = createAction<{ user: User | null; themePreference: ThemePreference | null }>(
  'app/hydrated',
);
