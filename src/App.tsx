import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useAppTheme } from './hooks/useAppTheme';
import RootNavigator from './navigation/RootNavigator';
import { makeStore } from './store';
import { hydrated } from './store/actions';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadPersistedState } from './store/persistence';
import { selectIsHydrated } from './store/selectors';

function AppShell() {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector(selectIsHydrated);
  const theme = useAppTheme();

  useEffect(() => {
    loadPersistedState().then((persisted) => dispatch(hydrated(persisted)));
  }, [dispatch]);

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {isHydrated ? (
        <NavigationContainer theme={theme}>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      )}
    </>
  );
}

export default function App() {
  // Created once per app instance (and fresh per test render).
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppShell />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
