import { skipToken } from '@reduxjs/toolkit/query';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useAddRecentSearchMutation,
  useClearRecentSearchesMutation,
  useGetRecentSearchesQuery,
} from '../api/api';
import RecentSearchItem from '../components/RecentSearchItem';
import SearchForm from '../components/SearchForm';
import { useAppTheme } from '../hooks/useAppTheme';
import type { HomeScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/selectors';
import { prefilled } from '../store/slices/searchFormSlice';
import { spacing } from '../theme/theme';
import type { RecentSearch, SearchParams } from '../types/models';
import { getErrorMessage } from '../utils/errors';
import { MAX_RECENT_SEARCHES } from '../utils/search';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const recent = useGetRecentSearchesQuery(user?.id ?? skipToken);
  const [addRecentSearch] = useAddRecentSearchMutation();
  const [clearRecentSearches, { isLoading: isClearing }] = useClearRecentSearchesMutation();

  const onSearch = useCallback(
    (params: SearchParams) => {
      if (user) {
        addRecentSearch({ userId: user.id, search: params })
          .unwrap()
          .catch((e: unknown) => Alert.alert('Search not saved to recents', getErrorMessage(e)));
      }
      navigation.navigate('SearchResults', params);
    },
    [user, addRecentSearch, navigation],
  );

  const onPrefill = useCallback(
    (search: RecentSearch) => {
      dispatch(prefilled(search));
    },
    [dispatch],
  );

  const onClear = () => {
    if (!user || !recent.data?.length) return;
    Alert.alert('Clear recent searches?', 'This removes your search history on all devices.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () =>
          clearRecentSearches({ userId: user.id, ids: (recent.data ?? []).map((r) => r.id).filter((id) => !id.startsWith('temp-')) })
            .unwrap()
            .catch((e: unknown) => Alert.alert('Could not clear', getErrorMessage(e))),
      },
    ]);
  };

  const header = (
    <View>
      <Text style={[styles.greeting, { color: colors.muted }]}>
        Hi {user?.name.split(' ')[0] ?? 'there'} 👋
      </Text>
      <Text style={[styles.headline, { color: colors.text }]}>Where to next?</Text>
      <SearchForm onSubmit={onSearch} />
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent searches</Text>
        {recent.data && recent.data.length > 0 ? (
          <Pressable onPress={onClear} disabled={isClearing} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.clear, { color: colors.primary }]}>{isClearing ? 'Clearing…' : 'Clear'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const empty = recent.isLoading ? (
    <ActivityIndicator color={colors.primary} style={styles.loader} />
  ) : recent.isError ? (
    <Pressable onPress={() => void recent.refetch()} style={styles.emptyBox}>
      <Text style={[styles.emptyText, { color: colors.danger }]}>{getErrorMessage(recent.error)}</Text>
      <Text style={[styles.retry, { color: colors.primary }]}>Tap to retry</Text>
    </Pressable>
  ) : (
    <View style={styles.emptyBox}>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        Your last {MAX_RECENT_SEARCHES} searches will show up here. Tap one to fill the form.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={recent.data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RecentSearchItem search={item} onPress={onPrefill} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { fontSize: 15 },
  headline: { fontSize: 26, fontWeight: '800', marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  clear: { fontSize: 15, fontWeight: '600' },
  loader: { marginTop: spacing.lg },
  emptyBox: { paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.xs },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retry: { fontWeight: '600' },
});
