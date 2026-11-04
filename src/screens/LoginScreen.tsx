import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginMutation } from '../api/api';
import Button from '../components/Button';
import { useAppTheme } from '../hooks/useAppTheme';
import type { LoginScreenProps } from '../navigation/types';
import { radius, spacing } from '../theme/theme';
import { getErrorMessage } from '../utils/errors';

export const DEMO_CREDENTIALS = { identifier: 'demo@flightapp.dev', password: 'password123' };

export default function LoginScreen(_props: LoginScreenProps) {
  const { colors } = useAppTheme();
  const [login, { isLoading, error, reset }] = useLoginMutation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const identifierError = touched && !identifier.trim() ? 'Enter your email or username' : undefined;
  const passwordError = touched && !password ? 'Enter your password' : undefined;

  const submit = () => {
    setTouched(true);
    if (!identifier.trim() || !password) return;
    // On success the auth slice stores the user and RootNavigator swaps to the main app.
    login({ identifier, password }).catch(() => undefined);
  };

  const inputStyle = (hasError: boolean) => [
    styles.inputRow,
    { backgroundColor: colors.inputBackground, borderColor: hasError ? colors.danger : colors.border },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="airplane" size={40} color={colors.onPrimary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome aboard</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Sign in to search and save flights</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Email or username</Text>
            <View style={inputStyle(!!identifierError)}>
              <Ionicons name="mail-outline" size={20} color={colors.muted} />
              <TextInput
                testID="login-identifier"
                value={identifier}
                onChangeText={(t) => {
                  setIdentifier(t);
                  if (error) reset();
                }}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={[styles.input, { color: colors.text }]}
              />
            </View>
            {identifierError ? <Text style={[styles.error, { color: colors.danger }]}>{identifierError}</Text> : null}

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={inputStyle(!!passwordError)}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
              <TextInput
                ref={passwordRef}
                testID="login-password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) reset();
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
                style={[styles.input, { color: colors.text }]}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
              </Pressable>
            </View>
            {passwordError ? <Text style={[styles.error, { color: colors.danger }]}>{passwordError}</Text> : null}

            {error ? (
              <View style={[styles.banner, { borderColor: colors.danger }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text style={[styles.bannerText, { color: colors.danger }]}>{getErrorMessage(error)}</Text>
              </View>
            ) : null}

            <Button testID="login-submit" title="Sign in" onPress={submit} loading={isLoading} style={styles.submit} />

            <Pressable
              onPress={() => {
                setIdentifier(DEMO_CREDENTIALS.identifier);
                setPassword(DEMO_CREDENTIALS.password);
                reset();
              }}
              style={[styles.demo, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
            >
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.demoText, { color: colors.text }]}>
                Demo account: <Text style={styles.bold}>{DEMO_CREDENTIALS.identifier}</Text> /{' '}
                <Text style={styles.bold}>{DEMO_CREDENTIALS.password}</Text>
                {'\n'}
                <Text style={{ color: colors.primary }}>Tap to fill</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
    transform: [{ rotate: '-12deg' }],
  },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: spacing.xs },
  form: { marginTop: spacing.xxl },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  error: { fontSize: 13, marginTop: 4 },
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  bannerText: { flex: 1, fontSize: 14 },
  submit: { marginTop: spacing.xl },
  demo: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  demoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  bold: { fontWeight: '700' },
});
