import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Airport } from '../types/models';
import { searchAirports } from '../data/airports';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing } from '../theme/theme';

interface AirportPickerModalProps {
  visible: boolean;
  title: string;
  selectedCode: string | null;
  /** Airport chosen in the other field – shown but not selectable. */
  excludeCode: string | null;
  onSelect: (airport: Airport) => void;
  onClose: () => void;
}

/** Full-screen airport search with autocomplete by code, city, name or country. */
export default function AirportPickerModal({
  visible,
  title,
  selectedCode,
  excludeCode,
  onSelect,
  onClose,
}: AirportPickerModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchAirports(query, 50), [query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      onRequestClose={close}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? spacing.lg : insets.top + spacing.sm },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="airport-search-input"
            value={query}
            onChangeText={setQuery}
            placeholder="City, airport or code (e.g. TIA)"
            placeholderTextColor={colors.muted}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            style={[styles.input, { color: colors.text }]}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={results}
          keyExtractor={(a) => a.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.muted }]}>No airports match “{query}”</Text>
          }
          renderItem={({ item }) => {
            const disabled = item.code === excludeCode;
            const selected = item.code === selectedCode;
            return (
              <Pressable
                testID={`airport-option-${item.code}`}
                disabled={disabled}
                onPress={() => {
                  setQuery('');
                  onSelect(item);
                }}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }, disabled && styles.disabled]}
              >
                <View style={[styles.codeBox, { backgroundColor: selected ? colors.primary : colors.surfaceAlt }]}>
                  <Text style={[styles.code, { color: selected ? colors.onPrimary : colors.primary }]}>{item.code}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.city, { color: colors.text }]}>
                    {item.city}, {item.country}
                  </Text>
                  <Text style={[styles.name, { color: colors.muted }]} numberOfLines={1}>
                    {disabled ? 'Already selected for the other field' : item.name}
                  </Text>
                </View>
                {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: spacing.md },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 76 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  disabled: { opacity: 0.4 },
  codeBox: { width: 48, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  code: { fontWeight: '800', fontSize: 14 },
  rowText: { flex: 1 },
  city: { fontSize: 15, fontWeight: '600' },
  name: { fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', padding: spacing.xl },
});
