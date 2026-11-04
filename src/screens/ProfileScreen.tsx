import { Ionicons } from '@expo/vector-icons';
import { skipToken } from '@reduxjs/toolkit/query';
import type { ComponentProps, ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { api, useGetFavoritesQuery, useGetRecentSearchesQuery } from '../api/api';
import Button from '../components/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import type { ProfileScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectThemePreference } from '../store/selectors';
import { loggedOut } from '../store/slices/authSlice';
import { themePreferenceChanged } from '../store/slices/themeSlice';
import { radius, spacing } from '../theme/theme';
import { formatLongDate } from '../utils/dates';

function Row({
  icon,
  label,
  value,
  right,
  last = false,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  right?: ReactNode;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {value ? <Text style={[styles.rowValue, { color: colors.muted }]}>{value}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function ProfileScreen(_props: ProfileScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const preference = useAppSelector(selectThemePreference);
  const favorites = useGetFavoritesQuery(user?.id ?? skipToken);
  const recent = useGetRecentSearchesQuery(user?.id ?? skipToken);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const logout = () =>
    Alert.alert('Log out?', 'You will need to sign in again to see your flights.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          dispatch(loggedOut());
          dispatch(api.util.resetApiState());
        },
      },
    ]);

  const stats = [
    { label: 'Favorites', value: favorites.data?.length ?? '–' },
    { label: 'Recent searches', value: recent.data?.length ?? '–' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.onPrimary }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>@{user.username}</Text>
      </View>

      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.muted }]}>ACCOUNT</Text>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Row icon="person-outline" label="Name" value={user.name} />
        <Row icon="mail-outline" label="Email" value={user.email} />
        <Row icon="calendar-outline" label="Member since" value={formatLongDate(user.createdAt.slice(0, 10))} last />
      </View>

      <Text style={[styles.section, { color: colors.muted }]}>APPEARANCE</Text>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Row
          icon="moon-outline"
          label="Dark mode"
          value={preference === 'system' ? 'Following system' : undefined}
          right={
            <Switch
              testID="dark-mode-switch"
              value={theme.dark}
              onValueChange={(on) => {
                dispatch(themePreferenceChanged(on ? 'dark' : 'light'));
              }}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel="Dark mode"
            />
          }
        />
        <Row
          icon="phone-portrait-outline"
          label="Use system theme"
          last
          right={
            <Switch
              testID="system-theme-switch"
              value={preference === 'system'}
              onValueChange={(on) => {
                dispatch(themePreferenceChanged(on ? 'system' : theme.scheme));
              }}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel="Use system theme"
            />
          }
        />
      </View>

      <Button title="Log out" icon="log-out-outline" variant="danger" onPress={logout} style={styles.logout} testID="logout-button" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginVertical: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700', marginTop: spacing.md },
  email: { fontSize: 15, marginTop: 2 },
  stats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  stat: { flex: 1, alignItems: 'center', padding: spacing.lg, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 13, marginTop: 2 },
  section: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.sm },
  group: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 56 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16 },
  rowValue: { fontSize: 13, marginTop: 2 },
  logout: { marginTop: spacing.xxl },
});
