import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../api/api';
import authReducer, { loggedOut } from './slices/authSlice';
import searchFormReducer from './slices/searchFormSlice';
import themeReducer from './slices/themeSlice';
import { persistenceMiddleware } from './persistence';

const appReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  searchForm: searchFormReducer,
  [api.reducerPath]: api.reducer,
});

export type RootState = ReturnType<typeof appReducer>;

/** On logout, wipe all user-scoped state but keep the device's theme choice. */
const rootReducer = (state: Parameters<typeof appReducer>[0], action: UnknownAction): RootState => {
  if (loggedOut.match(action) && state) {
    return appReducer({ theme: state.theme }, action);
  }
  return appReducer(state, action);
};

export function makeStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(persistenceMiddleware.middleware).concat(api.middleware),
  });
  setupListeners(store.dispatch);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
