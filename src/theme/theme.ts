import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { ColorScheme } from '../types/models';

/** React Navigation theme extended with app-specific tokens. */
export interface AppTheme extends Theme {
  scheme: ColorScheme;
  colors: Theme['colors'] & {
    muted: string;
    surfaceAlt: string;
    onPrimary: string;
    success: string;
    warning: string;
    danger: string;
    favorite: string;
    inputBackground: string;
    shadow: string;
  };
}

export const lightTheme: AppTheme = {
  ...DefaultTheme,
  scheme: 'light',
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1D5FD6',
    background: '#F2F5FA',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: '#E11D48',
    muted: '#64748B',
    surfaceAlt: '#EAF0F9',
    onPrimary: '#FFFFFF',
    success: '#15803D',
    warning: '#B45309',
    danger: '#DC2626',
    favorite: '#E11D48',
    inputBackground: '#F5F7FB',
    shadow: '#0F172A',
  },
};

export const darkTheme: AppTheme = {
  ...DarkTheme,
  scheme: 'dark',
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#6EA8FE',
    background: '#0B1120',
    card: '#151E31',
    text: '#E6EAF2',
    border: '#26324A',
    notification: '#FB7185',
    muted: '#94A3B8',
    surfaceAlt: '#1D2840',
    onPrimary: '#0B1120',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171',
    favorite: '#FB7185',
    inputBackground: '#1A2438',
    shadow: '#000000',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
