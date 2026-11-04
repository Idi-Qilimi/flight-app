import { StyleSheet, Text, View } from 'react-native';
import type { FlightStatus } from '../types/models';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius } from '../theme/theme';

export default function StatusBadge({ status, delayMinutes = 0 }: { status: FlightStatus; delayMinutes?: number }) {
  const { colors } = useAppTheme();
  const color: Record<FlightStatus, string> = {
    Scheduled: colors.primary,
    'On time': colors.success,
    Boarding: colors.success,
    Delayed: colors.warning,
    Cancelled: colors.danger,
  };
  const label = status === 'Delayed' && delayMinutes > 0 ? `Delayed ${delayMinutes}m` : status;

  return (
    <View style={[styles.badge, { borderColor: color[status] }]}>
      <View style={[styles.dot, { backgroundColor: color[status] }]} />
      <Text style={[styles.text, { color: color[status] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
