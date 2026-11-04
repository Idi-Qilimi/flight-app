import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchParams } from '../types/models';

export type FlightDetailsParams = { flightId: string };

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  SearchResults: SearchParams;
  FlightDetails: FlightDetailsParams;
};

export type FavoritesStackParamList = {
  Favorites: undefined;
  FlightDetails: FlightDetailsParams;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type MoreStackParamList = {
  More: undefined;
  Settings: undefined;
  Help: undefined;
  About: undefined;
  Contact: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  FavoritesTab: NavigatorScreenParams<FavoritesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};

type TabProps<Tab extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, Tab>;

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  TabProps<'HomeTab'>
>;
export type SearchResultsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'SearchResults'>,
  TabProps<'HomeTab'>
>;
export type FavoritesScreenProps = CompositeScreenProps<
  NativeStackScreenProps<FavoritesStackParamList, 'Favorites'>,
  TabProps<'FavoritesTab'>
>;
/** Flight details is mounted in both the Home and Favorites stacks. */
export type FlightDetailsScreenProps = NativeStackScreenProps<
  { FlightDetails: FlightDetailsParams },
  'FlightDetails'
>;
export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Profile'>,
  TabProps<'ProfileTab'>
>;
export type MoreScreenProps = NativeStackScreenProps<MoreStackParamList, 'More'>;
export type MoreSubScreenName = Exclude<keyof MoreStackParamList, 'More'>;
export type PlaceholderScreenProps = NativeStackScreenProps<MoreStackParamList, MoreSubScreenName>;
