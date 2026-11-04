import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { makeStore, type AppStore, type RootState } from './store';
import type { Flight } from './types/models';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export async function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = makeStore(preloadedState), ...options }: {
    preloadedState?: Partial<RootState>;
    store?: AppStore;
  } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>{children}</SafeAreaProvider>
    </Provider>
  );
  const result = await render(ui, { wrapper: Wrapper, ...options });
  return { store, ...result };
}

export const sampleFlight: Flight = {
  id: 'AZ573_TIA_FCO_2026-10-12',
  flightNumber: 'AZ573',
  airline: { code: 'AZ', name: 'ITA Airways' },
  origin: 'TIA',
  destination: 'FCO',
  departureTime: '2026-10-12T23:10',
  arrivalTime: '2026-10-13T00:35',
  durationMinutes: 85,
  aircraft: 'Airbus A320neo',
  terminal: '1',
  gate: 'B12',
  status: 'Delayed',
  delayMinutes: 20,
  price: 129,
  currency: 'EUR',
  seatsLeft: 7,
};
