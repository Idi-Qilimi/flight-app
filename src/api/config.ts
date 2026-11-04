import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3001;

/**
 * Resolves the json-server URL.
 *
 * 1. `EXPO_PUBLIC_API_URL` wins if set (e.g. a tunnel or deployed server).
 * 2. In development, reuse the host the Metro bundler is served from, so a
 *    physical device on the same Wi-Fi reaches json-server on the dev machine.
 * 3. Fall back to the emulator/simulator loopback address.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.20:8081"
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;

  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();

/** Simulated network latency for the mock flight provider, in ms. */
export const MOCK_LATENCY_MS = 650;
