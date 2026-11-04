import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SearchParams } from '../types/models';
import { getAirport } from '../data/airports';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectSearchForm } from '../store/selectors';
import {
  airportsSwapped,
  departureDateChanged,
  destinationChanged,
  originChanged,
  returnDateChanged,
} from '../store/slices/searchFormSlice';
import { radius, spacing } from '../theme/theme';
import { formatShortDate, formatWeekdayYear, todayISO } from '../utils/dates';
import { SAME_AIRPORT_ERROR, validateSearch, type SearchErrors } from '../utils/search';
import AirportPickerModal from './AirportPickerModal';
import Button from './Button';
import CalendarModal from './CalendarModal';

type Picker = 'origin' | 'destination' | 'departureDate' | 'returnDate' | null;

interface FieldProps {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  value: string;
  subValue?: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
  testID: string;
}

function Field({ label, icon, value, subValue, placeholder, error, onPress, testID }: FieldProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.fieldWrap}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: pressed ? colors.surfaceAlt : colors.inputBackground,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
        <View style={styles.fieldText}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
          <Text style={[styles.fieldValue, { color: value ? colors.text : colors.muted }]} numberOfLines={1}>
            {value || placeholder}
          </Text>
          {subValue ? (
            <Text style={[styles.fieldSub, { color: colors.muted }]} numberOfLines={1}>
              {subValue}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export default function SearchForm({ onSubmit }: { onSubmit: (params: SearchParams) => void }) {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const form = useAppSelector(selectSearchForm);
  const [picker, setPicker] = useState<Picker>(null);
  const [submitted, setSubmitted] = useState(false);
  const [spin] = useState(() => new Animated.Value(0));

  const today = todayISO();
  const errors: SearchErrors = validateSearch(form, today);
  // Same-airport is shown immediately; other errors only after a submit attempt.
  const visibleErrors: SearchErrors = submitted
    ? errors
    : { destination: errors.destination === SAME_AIRPORT_ERROR ? errors.destination : undefined };

  const origin = form.origin ? getAirport(form.origin) : undefined;
  const destination = form.destination ? getAirport(form.destination) : undefined;

  const swap = () => {
    Animated.timing(spin, { toValue: 1, duration: 250, useNativeDriver: true }).start(() => spin.setValue(0));
    dispatch(airportsSwapped());
  };

  const submit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || !form.origin || !form.destination) return;
    setSubmitted(false);
    onSubmit({
      origin: form.origin,
      destination: form.destination,
      departureDate: form.departureDate,
      returnDate: form.returnDate,
    });
  };

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View>
        <Field
          testID="origin-field"
          label="From"
          icon="airplane-outline"
          value={origin ? `${origin.code} – ${origin.city}` : ''}
          subValue={origin?.name}
          placeholder="Select origin"
          error={visibleErrors.origin}
          onPress={() => setPicker('origin')}
        />
        <Field
          testID="destination-field"
          label="To"
          icon="location-outline"
          value={destination ? `${destination.code} – ${destination.city}` : ''}
          subValue={destination?.name}
          placeholder="Select destination"
          error={visibleErrors.destination}
          onPress={() => setPicker('destination')}
        />
        <Pressable
          testID="swap-airports"
          onPress={swap}
          accessibilityRole="button"
          accessibilityLabel="Swap origin and destination"
          style={[styles.swap, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Field
            testID="departure-field"
            label="Departure"
            icon="calendar-outline"
            value={formatShortDate(form.departureDate)}
            subValue={formatWeekdayYear(form.departureDate)}
            placeholder="Select date"
            error={visibleErrors.departureDate}
            onPress={() => setPicker('departureDate')}
          />
        </View>
        <View style={styles.flex}>
          <Field
            testID="return-field"
            label="Return"
            icon="calendar-outline"
            value={formatShortDate(form.returnDate)}
            subValue={formatWeekdayYear(form.returnDate)}
            placeholder="Select date"
            error={visibleErrors.returnDate}
            onPress={() => setPicker('returnDate')}
          />
        </View>
      </View>

      <Button testID="search-button" title="Search flights" icon="search" onPress={submit} />

      <AirportPickerModal
        visible={picker === 'origin' || picker === 'destination'}
        title={picker === 'origin' ? 'Flying from' : 'Flying to'}
        selectedCode={picker === 'origin' ? form.origin : form.destination}
        excludeCode={picker === 'origin' ? form.destination : form.origin}
        onClose={() => setPicker(null)}
        onSelect={(airport) => {
          dispatch(picker === 'origin' ? originChanged(airport.code) : destinationChanged(airport.code));
          setPicker(null);
        }}
      />
      <CalendarModal
        visible={picker === 'departureDate' || picker === 'returnDate'}
        title={picker === 'departureDate' ? 'Departure date' : 'Return date'}
        value={picker === 'returnDate' ? form.returnDate : form.departureDate}
        minDate={picker === 'returnDate' ? form.departureDate : today}
        rangeStart={form.departureDate}
        rangeEnd={form.returnDate}
        onClose={() => setPicker(null)}
        onSelect={(date) => {
          dispatch(picker === 'departureDate' ? departureDateChanged(date) : returnDateChanged(date));
          setPicker(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  fieldWrap: { marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  fieldText: { flex: 1 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  fieldSub: { fontSize: 12, marginTop: 1 },
  error: { fontSize: 13, marginTop: 4, marginLeft: 4 },
  swap: {
    position: 'absolute',
    right: spacing.lg,
    top: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
