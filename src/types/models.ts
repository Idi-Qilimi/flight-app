/** ISO calendar date, e.g. "2026-10-12". */
export type ISODate = string;
/** Airport-local date-time without timezone, e.g. "2026-10-12T06:35". */
export type LocalDateTime = string;

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Airline {
  code: string;
  name: string;
}

export type FlightStatus = 'Scheduled' | 'On time' | 'Boarding' | 'Delayed' | 'Cancelled';

export interface Flight {
  /** Stable, self-describing id: `<flightNumber>_<origin>_<destination>_<date>` */
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: string;
  destination: string;
  departureTime: LocalDateTime;
  arrivalTime: LocalDateTime;
  durationMinutes: number;
  aircraft: string;
  terminal: string;
  gate: string;
  status: FlightStatus;
  delayMinutes: number;
  price: number;
  currency: string;
  seatsLeft: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: ISODate;
  /** The "arrival date" from the brief – the date of the return leg. */
  returnDate: ISODate;
}

export interface SearchResults {
  outbound: Flight[];
  inbound: Flight[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  createdAt: string;
}

/** User record as stored in json-server (includes the mock password). */
export interface UserRecord extends User {
  password: string;
}

export interface RecentSearch extends SearchParams {
  id: string;
  userId: string;
  createdAt: string;
}

export interface FavoriteFlight {
  id: string;
  userId: string;
  flightId: string;
  /** Snapshot of the flight at the time it was saved. */
  flight: Flight;
  createdAt: string;
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';
