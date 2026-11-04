import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppSelector } from '../store/hooks';
import { selectIsLoggedIn } from '../store/selectors';
import type {
  AuthStackParamList,
  FavoritesStackParamList,
  HomeStackParamList,
  MainTabParamList,
  MoreStackParamList,
  ProfileStackParamList,
} from './types';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import FlightDetailsScreen from '../screens/FlightDetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreScreen from '../screens/MoreScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function useStackOptions(): NativeStackNavigationOptions {
  const theme = useAppTheme();
  return {
    headerStyle: { backgroundColor: theme.colors.card },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { color: theme.colors.text },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: theme.colors.background },
  };
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={useStackOptions()}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Search flights' }} />
      <HomeStack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: 'Results' }} />
      <HomeStack.Screen name="FlightDetails" component={FlightDetailsScreen} options={{ title: 'Flight details' }} />
    </HomeStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={useStackOptions()}>
      <FavoritesStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorite flights' }} />
      <FavoritesStack.Screen name="FlightDetails" component={FlightDetailsScreen} options={{ title: 'Flight details' }} />
    </FavoritesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={useStackOptions()}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={useStackOptions()}>
      <MoreStack.Screen name="More" component={MoreScreen} />
      <MoreStack.Screen name="Settings" component={PlaceholderScreen} />
      <MoreStack.Screen name="Help" component={PlaceholderScreen} options={{ title: 'Help & support' }} />
      <MoreStack.Screen name="About" component={PlaceholderScreen} />
      <MoreStack.Screen name="Contact" component={PlaceholderScreen} options={{ title: 'Contact us' }} />
    </MoreStack.Navigator>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];
const TAB_ICONS: Record<keyof MainTabParamList, [active: IconName, inactive: IconName]> = {
  HomeTab: ['airplane', 'airplane-outline'],
  FavoritesTab: ['heart', 'heart-outline'],
  ProfileTab: ['person-circle', 'person-circle-outline'],
  MoreTab: ['grid', 'grid-outline'],
};

function MainTabs() {
  const theme = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="FavoritesTab" component={FavoritesStackNavigator} options={{ title: 'Favorites' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
      <Tab.Screen name="MoreTab" component={MoreStackNavigator} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}

/** Shows the login flow when signed out and the main app when signed in. */
export default function RootNavigator() {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const stackOptions = useStackOptions();

  if (!isLoggedIn) {
    return (
      <AuthStack.Navigator screenOptions={{ ...stackOptions, headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }
  return <MainTabs />;
}
