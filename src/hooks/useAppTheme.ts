import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { selectThemePreference } from '../store/selectors';
import { resolveColorScheme } from '../store/slices/themeSlice';
import { darkTheme, lightTheme, type AppTheme } from '../theme/theme';

export function useAppTheme(): AppTheme {
  const preference = useAppSelector(selectThemePreference);
  const system = useColorScheme();
  return resolveColorScheme(preference, system) === 'dark' ? darkTheme : lightTheme;
}
