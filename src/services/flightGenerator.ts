/**
 * Deterministic mock flight "provider".
 *
 * Flights are generated from a seed derived from route + date, so the same
 * search always yields the same flights, and any flight can be re-created
 * from its id alone (used by the Flight Details screen).
 */
import type { Airline, Flight, FlightStatus, ISODate, SearchParams, SearchResults } from '../types/models';
import { AIRLINES } from '../data/airlines';
import { getAirport } from '../data/airports';
import { addMinutes, isValidISODate } from '../utils/dates';

/** FNV-1a 32-bit string hash. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Small, fast seeded PRNG (mulberry32). */
export function createRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function aircraftFor(distance: number): readonly string[] {
  if (distance < 700) return ['ATR 72-600', 'Embraer E190', 'Airbus A319'];
  if (distance < 2500) return ['Airbus A320neo', 'Boeing 737-800', 'Airbus A321neo', 'Boeing 737 MAX 8'];
  if (distance < 5000) return ['Airbus A321LR', 'Boeing 757-200', 'Airbus A330-300'];
  return ['Boeing 787-9', 'Airbus A350-900', 'Boeing 777-300ER'];
}

function statusFor(rand: () => number): FlightStatus {
  const r = rand();
  if (r < 0.55) return 'Scheduled';
  if (r < 0.75) return 'On time';
  if (r < 0.8) return 'Boarding';
  if (r < 0.95) return 'Delayed';
  return 'Cancelled';
}

export function buildFlightId(flightNumber: string, origin: string, destination: string, date: ISODate): string {
  return `${flightNumber}_${origin}_${destination}_${date}`;
}

/** All flights operating on a route on a given day, sorted by departure time. */
export function generateFlightsForDay(origin: string, destination: string, date: ISODate): Flight[] {
  const from = getAirport(origin);
  const to = getAirport(destination);
  if (!from || !to || from.code === to.code || !isValidISODate(date)) return [];

  const rand = createRandom(hashString(`${from.code}-${to.code}-${date}`));
  const distance = distanceKm(from.lat, from.lon, to.lat, to.lon);
  // ~780 km/h cruise + 35 min taxi/climb, rounded down to 5 minutes.
  const rawDuration = Math.round((distance / 780) * 60 + 35);
  const durationMinutes = Math.max(40, rawDuration - (rawDuration % 5));
  const count = 3 + Math.floor(rand() * 5); // 3–7 flights per day
  const usedNumbers = new Set<string>();
  const flights: Flight[] = [];

  for (let i = 0; i < count; i++) {
    const airline: Airline = pick(rand, AIRLINES);
    let flightNumber: string;
    do {
      flightNumber = `${airline.code}${100 + Math.floor(rand() * 8900)}`;
    } while (usedNumbers.has(flightNumber));
    usedNumbers.add(flightNumber);

    // Departures between 05:30 and 22:30, on 5-minute boundaries.
    const departureMinutes = 330 + Math.floor(rand() * 205) * 5;
    const departureTime = addMinutes(`${date}T00:00`, departureMinutes);
    const flightDuration = durationMinutes + Math.floor(rand() * 4) * 5;
    const status = statusFor(rand);
    const delayMinutes = status === 'Delayed' ? 10 + Math.floor(rand() * 12) * 10 : 0;
    const basePrice = 35 + distance * 0.085;

    flights.push({
      id: buildFlightId(flightNumber, from.code, to.code, date),
      flightNumber,
      airline,
      origin: from.code,
      destination: to.code,
      departureTime,
      arrivalTime: addMinutes(departureTime, flightDuration),
      durationMinutes: flightDuration,
      aircraft: pick(rand, aircraftFor(distance)),
      terminal: String(1 + Math.floor(rand() * 3)),
      gate: `${pick(rand, ['A', 'B', 'C', 'D', 'E'])}${1 + Math.floor(rand() * 40)}`,
      status,
      delayMinutes,
      price: Math.round(basePrice * (0.7 + rand() * 0.9)),
      currency: 'EUR',
      seatsLeft: 1 + Math.floor(rand() * 60),
    });
  }

  return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

export function searchFlights(params: SearchParams): SearchResults {
  return {
    outbound: generateFlightsForDay(params.origin, params.destination, params.departureDate),
    inbound: generateFlightsForDay(params.destination, params.origin, params.returnDate),
  };
}

export function getFlightById(id: string): Flight | null {
  const [, origin, destination, date] = id.split('_');
  if (!origin || !destination || !date) return null;
  return generateFlightsForDay(origin, destination, date).find((f) => f.id === id) ?? null;
}
