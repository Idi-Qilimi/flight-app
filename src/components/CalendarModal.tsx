import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ISODate } from '../types/models';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing } from '../theme/theme';
import { monthName, parseISODate, toISODate } from '../utils/dates';

interface CalendarModalProps {
  visible: boolean;
  title: string;
  value: ISODate;
  minDate: ISODate;
  /** Optional highlighted trip range. */
  rangeStart?: ISODate;
  rangeEnd?: ISODate;
  onSelect: (date: ISODate) => void;
  onClose: () => void;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Monday-first grid of a month; `null` cells are leading blanks. */
export function buildMonthGrid(year: number, month: number): (ISODate | null)[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (ISODate | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(toISODate(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * Dependency-free, themeable date picker. Chosen over a native picker so it
 * looks identical on iOS/Android/web, follows the app theme, and runs in Expo Go.
 */
export default function CalendarModal({
  visible,
  title,
  value,
  minDate,
  rangeStart,
  rangeEnd,
  onSelect,
  onClose,
}: CalendarModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [cursor, setCursor] = useState(() => parseISODate(value));

  // Jump back to the selected month whenever the picker opens
  // ("adjust state while rendering" pattern instead of an effect).
  const openedFor = visible ? value : null;
  const [syncedFor, setSyncedFor] = useState(openedFor);
  if (openedFor !== syncedFor) {
    setSyncedFor(openedFor);
    if (openedFor) setCursor(parseISODate(openedFor));
  }

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor.year, cursor.month]);
  const min = parseISODate(minDate);
  const canGoBack = cursor.year > min.year || (cursor.year === min.year && cursor.month > min.month);

  const shiftMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const index = year * 12 + (month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1, day: 1 };
    });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close calendar">
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + spacing.lg }]}
          onPress={() => undefined}
        >
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.monthRow}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              disabled={!canGoBack}
              hitSlop={12}
              accessibilityLabel="Previous month"
              style={{ opacity: canGoBack ? 1 : 0.3 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <Text style={[styles.month, { color: colors.text }]}>
              {monthName(cursor.month)} {cursor.year}
            </Text>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={12} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={[styles.weekday, { color: colors.muted }]}>
                {d}
              </Text>
            ))}
            {cells.map((date, i) => {
              if (!date) return <View key={`blank-${i}`} style={styles.cell} />;
              const disabled = date < minDate;
              const selected = date === value;
              const inRange = !!rangeStart && !!rangeEnd && date >= rangeStart && date <= rangeEnd;
              return (
                <Pressable
                  key={date}
                  testID={`calendar-day-${date}`}
                  disabled={disabled}
                  onPress={() => onSelect(date)}
                  style={styles.cell}
                  accessibilityRole="button"
                  accessibilityState={{ disabled, selected }}
                  accessibilityLabel={date}
                >
                  <View
                    style={[
                      styles.day,
                      inRange && { backgroundColor: colors.surfaceAlt },
                      selected && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: selected ? colors.onPrimary : disabled ? colors.border : colors.text },
                      ]}
                    >
                      {Number(date.slice(8))}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  month: { fontSize: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '600', marginBottom: spacing.sm },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  day: { flex: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 15, fontWeight: '500' },
});
