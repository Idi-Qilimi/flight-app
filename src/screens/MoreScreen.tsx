import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import type { MoreScreenProps, MoreSubScreenName } from '../navigation/types';
import { radius, spacing } from '../theme/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const MORE_ITEMS: { route: MoreSubScreenName; label: string; description: string; icon: IconName }[] = [
  { route: 'Settings', label: 'Settings', description: 'Notifications, units and language', icon: 'settings-outline' },
  { route: 'Help', label: 'Help & support', description: 'FAQs and troubleshooting', icon: 'help-buoy-outline' },
  { route: 'About', label: 'About', description: 'Version and legal information', icon: 'information-circle-outline' },
  { route: 'Contact', label: 'Contact us', description: 'Get in touch with our team', icon: 'chatbubbles-outline' },
];

export default function MoreScreen({ navigation }: MoreScreenProps) {
  const { colors } = useAppTheme();
  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MORE_ITEMS.map((item, index) => (
          <Pressable
            key={item.route}
            testID={`more-${item.route}`}
            accessibilityRole="button"
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => [
              styles.row,
              index < MORE_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
              pressed && { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.text}>
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.description, { color: colors.muted }]}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  group: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  icon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 13, marginTop: 2 },
});
