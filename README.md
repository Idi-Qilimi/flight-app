# ✈️ Flight App

A React Native (Expo) take-home app. Users can log in, search for flights, keep a list of recent searches, save favorite flights and view flight details. It has light and dark themes.

| | |
|---|---|
| **Stack** | Expo SDK 58 · React Native 0.88 · TypeScript (strict) |
| **Navigation** | React Navigation 7 (native stack + bottom tabs) |
| **State** | Redux Toolkit + RTK Query (only state-management library) |
| **Backend** | json-server stores users, favorites and recent searches |
| **Flights** | Deterministic mock provider (filtered by route + date) |
| **Tests** | Jest (`jest-expo`) + React Native Testing Library |

---

## Getting started

### Prerequisites
- Node 20+ and npm
- The **Expo Go** app on a phone, or an Android emulator / iOS simulator

### 1. Install
```bash
npm install
```

### 2. Start the API (json-server), in its own terminal
```bash
npm run server
```
On first run this copies `server/db.seed.json` to `server/db.json`. It then serves that file on **port 3001** on all network interfaces, so phones on your Wi-Fi can reach it.
Run `npm run server:reset` (with the server stopped) to restore the seed data.

### 3. Start the app
```bash
npm start          # then press a (Android), i (iOS) or scan the QR code with Expo Go
```

### 4. Log in
| Email | Username | Password |
|---|---|---|
| `demo@flightapp.dev` | `demo` | `password123` |
| `jane@flightapp.dev` | `jane` | `password123` |

The login screen has a "Tap to fill" shortcut for the demo account.

### How the app finds the API
`src/api/config.ts` picks the API URL in this order:
1. `EXPO_PUBLIC_API_URL`, if set (e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:3001 npm start`).
2. Otherwise, the host that Metro serves the bundle from (`expo-constants` → `hostUri`). This works automatically on a physical device on the same Wi-Fi, and on emulators.
3. Otherwise, `10.0.2.2` on Android or `localhost` on iOS/web.

> **Physical device can't connect?** Allow inbound connections on port 3001 in your OS firewall, or set `EXPO_PUBLIC_API_URL`. If the server is unreachable, the app shows the URL it tried.

### Quality checks
```bash
npm test           # 33 unit/component tests
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
```

---

## Features

| Requirement | Where |
|---|---|
| Login screen with email/username + password, mocked auth, auth-gated navigation | `screens/LoginScreen.tsx`, `navigation/RootNavigator.tsx` |
| Home: search form (origin, destination, departure, return date) + recent searches | `screens/HomeScreen.tsx`, `components/SearchForm.tsx` |
| Origin ≠ destination (enforced in the validator *and* in the picker) | `utils/search.ts`, `components/AirportPickerModal.tsx` |
| Search saves to recents → Search Results screen (flight no., airline, times, favorite toggle) | `screens/SearchResultsScreen.tsx`, `components/FlightCard.tsx` |
| Recent searches show "TIA → FCO · 12 Oct – 15 Oct", tap to prefill, newest first, max 10, de-duplicated, persisted | `components/RecentSearchItem.tsx`, `utils/search.ts`, json-server |
| Favorites screen with remove; persisted | `screens/FavoritesScreen.tsx`, json-server |
| Flight details (times, aircraft, terminal, gate, boarding, status, seats, price) from Results *and* Favorites | `screens/FlightDetailsScreen.tsx` |
| Nested stacks with headers and back navigation: Home → Results → Details, Favorites → Details, More → sub-pages | `navigation/RootNavigator.tsx` |
| Bottom tabs: Home, Favorites, Profile, More | `navigation/RootNavigator.tsx` |
| Profile: user info, dark-mode toggle, logout | `screens/ProfileScreen.tsx` |
| More: Settings, Help, About, Contact placeholder screens | `screens/MoreScreen.tsx`, `screens/PlaceholderScreen.tsx` |
| Light/dark theme across screens, headers and tab bar | `theme/theme.ts`, `hooks/useAppTheme.ts` |

**Bonus items**
- ✅ Follows the system theme by default, and remembers an explicit choice ("Use system theme" switch on Profile).
- ✅ Pull-to-refresh on Search Results and Favorites.
- ✅ Airport autocomplete: search by IATA code, city, airport name or country, with ranked results.
- ✅ Unit tests for reducers, selectors, the mock provider, validation/formatting and components.
- ✅ Polish: favorite "pop" animation, skeleton loaders, animated swap button, `LayoutAnimation` on removal, optimistic updates, a themed calendar showing the selected trip range, empty/error states with retry, and accessibility labels.

---

## Architecture

```
src/
├── App.tsx                 Providers + startup hydration + NavigationContainer(theme)
├── api/
│   ├── api.ts              RTK Query API slice (json-server + mock flight endpoints)
│   └── config.ts           API URL resolution
├── store/
│   ├── index.ts            configureStore, root reducer (logout reset)
│   ├── slices/             auth · theme · searchForm
│   ├── persistence.ts      listener middleware → AsyncStorage (session + theme)
│   ├── selectors.ts
│   └── actions.ts          `hydrated` startup action
├── navigation/             typed param lists + navigators
├── screens/                one file per screen
├── components/             FlightCard, SearchForm, pickers, buttons…
├── services/flightGenerator.ts   deterministic mock flight provider
├── data/                   airports (with coordinates) & airlines
├── utils/                  dates, search validation/rules, errors
├── theme/                  light/dark tokens (extends React Navigation's Theme)
└── __tests__/
server/
├── db.seed.json            committed seed data
└── ensure-db.js            creates/resets server/db.json (git-ignored)
```

### Key decisions

**Expo (managed, CNG) rather than the bare CLI.** Every dependency here ships in Expo Go: React Navigation's native deps, AsyncStorage and vector icons. A reviewer can therefore run the app by scanning a QR code, without Xcode or Android Studio. EAS can produce store builds later, and `ios/`/`android/` are generated on demand. Nothing in this app needs custom native code, so the bare CLI would only add setup cost.

**React Navigation directly, not Expo Router.** The brief explicitly asks for React Navigation stacks and tabs. The dynamic API keeps the auth gate simple: `RootNavigator` renders either the auth stack or the tabs, based on Redux state. Each tab owns a native stack, which gives native headers, back gestures and per-tab history. Param lists are fully typed, and `CompositeScreenProps` covers cross-navigator navigation.

**Redux Toolkit as the only state layer.**
- *Server state* (users, favorites, recent searches, flights) lives in **RTK Query**, which is part of RTK. It provides caching, loading and error flags, tag invalidation and refetching for pull-to-refresh. Adding and removing favorites, and adding recent searches, use **optimistic updates**, so the UI responds instantly and rolls back on failure.
- *Client state* lives in three slices. `auth` holds the current user and a hydration flag. `theme` holds the preference: `system | light | dark`. `searchForm` holds the form draft. Keeping the draft in Redux makes "tap a recent search to prefill" a single `prefilled` action.
- Local `useState` is used only for ephemeral UI details, such as which picker is open or the text typed in the login field.

**Where data is persisted.**
- **json-server** stores the user records, favorites and recent searches, so these follow the account rather than the device.
- **AsyncStorage**, written through RTK listener middleware, keeps only two device-local values: the session (so a restart stays logged in) and the theme preference.
- On startup a `hydrated` action restores both before navigation renders, which avoids a flash of the login screen.
- On logout the root reducer wipes all user state except the theme, and the RTK Query cache is reset.

**Recent-search rules live in one pure function.** `applyRecentSearchRules` sorts newest first, removes duplicates and caps the list at 10. The client uses it for the optimistic update and for transforming responses. The `addRecentSearch` mutation also uses it to delete surplus rows on the server, so `db.json` never grows without bound. Repeating a search moves it to the top instead of duplicating it.

**Mock flight provider instead of a live API.** `flightGenerator.ts` seeds a PRNG from `origin-destination-date`, so the same search always returns the same 3–7 flights. Durations come from the great-circle distance between the airports, and aircraft types and prices scale with distance. A flight id (`AZ573_TIA_FCO_2026-10-12`) contains everything needed to rebuild that flight. Flight Details can therefore load any flight from its id alone, which keeps navigation params small and serializable. Favorites also store a snapshot of the flight as a fallback. The provider is wrapped in RTK Query `queryFn` endpoints with simulated latency. Swapping in Amadeus or another real API means replacing two `queryFn`s; the screens would not change.

**Themes.** `AppTheme` extends React Navigation's `Theme`. It is passed to `NavigationContainer`, so headers, tab bar and screen backgrounds follow it automatically. It adds extra tokens such as `muted`, `danger` and `favorite`. `useAppTheme()` combines the Redux preference with `useColorScheme()`. `app.json` sets `userInterfaceStyle: "automatic"` so the OS reports the system scheme.

**Custom calendar instead of a native date picker.** It looks the same on iOS and Android, follows the app theme (native pickers are awkward to theme in dark mode), shows the trip range, needs no native module and is easy to test.

### Trade-offs and limitations
- **Mock auth.** Passwords are plain text in `db.json` and are compared on the client. There is no token or session expiry. This is acceptable for a demo but must never ship. A real app would use an auth endpoint and keep tokens in `expo-secure-store`.
- **No sign-up flow.** Accounts come from the seed data.
- **json-server ids.** json-server v1 parses numeric-looking query values as numbers, so `?userId=1` does not match the string `"1"`. Seed user ids are therefore non-numeric (`usr-demo`). json-server generates non-numeric ids for new records.
- **Time zones.** Flight times are airport-local and stored without a timezone, as airline UIs show them. Duration is computed without timezone offsets.
- **"Arrival date"** from the brief is treated as the **return date**. Results show an outbound section and a return section.
- **Multi-device consistency.** Theme and session are per device; data in json-server is shared.
- **Offline.** Recent searches and favorites need the API. The app shows a clear error with retry, but there is no offline cache.

---

## Testing

```bash
npm test
```
- `flightGenerator.test.ts`: determinism, route/date filtering, sorting, unique ids, rebuilding from an id, edge cases.
- `search.test.ts`: validation (including origin ≠ destination), the label format, recent-search rules (cap, order, de-duplication), date maths, airport autocomplete ranking.
- `reducers.test.ts`: the `searchForm` and `theme` slices, system-theme resolution, hydration, the logout reset that keeps the theme, selectors.
- `components.test.tsx`: `FlightCard` content and callbacks, `RecentSearchItem`, and `SearchForm` submitting and blocking a search with the same origin and destination.

Jest notes: icon fonts are mocked in `jest.setup.tsx`, and the Redux ESM packages are added to `transformIgnorePatterns`.
