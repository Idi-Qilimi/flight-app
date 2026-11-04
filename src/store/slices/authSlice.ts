import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/models';
import { api } from '../../api/api';
import { hydrated } from '../actions';

export interface AuthState {
  user: User | null;
  /** False until the persisted session has been read at startup. */
  hydrated: boolean;
}

const initialState: AuthState = { user: null, hydrated: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut: () => ({ user: null, hydrated: true }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrated, (state, action) => {
        state.user = action.payload.user;
        state.hydrated = true;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      });
  },
});

export const { loggedOut } = authSlice.actions;
export default authSlice.reducer;
