import type { Airport } from '../types/models';

export const AIRPORTS: readonly Airport[] = [
  { code: 'TIA', city: 'Tirana', name: 'Tirana International Airport', country: 'Albania', lat: 41.4147, lon: 19.7206 },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino', country: 'Italy', lat: 41.8003, lon: 12.2389 },
  { code: 'CIA', city: 'Rome', name: 'Rome Ciampino', country: 'Italy', lat: 41.7994, lon: 12.5949 },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa', country: 'Italy', lat: 45.6306, lon: 8.7281 },
  { code: 'BGY', city: 'Bergamo', name: 'Milan Bergamo', country: 'Italy', lat: 45.6739, lon: 9.7042 },
  { code: 'VCE', city: 'Venice', name: 'Venice Marco Polo', country: 'Italy', lat: 45.5053, lon: 12.3519 },
  { code: 'BRI', city: 'Bari', name: 'Bari Karol Wojtyła', country: 'Italy', lat: 41.1389, lon: 16.7606 },
  { code: 'NAP', city: 'Naples', name: 'Naples International', country: 'Italy', lat: 40.886, lon: 14.2908 },
  { code: 'ATH', city: 'Athens', name: 'Athens International', country: 'Greece', lat: 37.9364, lon: 23.9445 },
  { code: 'SKG', city: 'Thessaloniki', name: 'Thessaloniki Macedonia', country: 'Greece', lat: 40.5197, lon: 22.9709 },
  { code: 'PRN', city: 'Pristina', name: 'Pristina International', country: 'Kosovo', lat: 42.5728, lon: 21.0358 },
  { code: 'SKP', city: 'Skopje', name: 'Skopje International', country: 'North Macedonia', lat: 41.9616, lon: 21.6214 },
  { code: 'TGD', city: 'Podgorica', name: 'Podgorica Airport', country: 'Montenegro', lat: 42.3594, lon: 19.2519 },
  { code: 'BEG', city: 'Belgrade', name: 'Belgrade Nikola Tesla', country: 'Serbia', lat: 44.8184, lon: 20.3091 },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Türkiye', lat: 41.2753, lon: 28.7519 },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International', country: 'Austria', lat: 48.1103, lon: 16.5697 },
  { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany', lat: 48.3538, lon: 11.7861 },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt am Main', country: 'Germany', lat: 50.0379, lon: 8.5622 },
  { code: 'BER', city: 'Berlin', name: 'Berlin Brandenburg', country: 'Germany', lat: 52.3667, lon: 13.5033 },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland', lat: 47.4647, lon: 8.5492 },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France', lat: 49.0097, lon: 2.5479 },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Schiphol', country: 'Netherlands', lat: 52.3105, lon: 4.7683 },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium', lat: 50.901, lon: 4.4844 },
  { code: 'LHR', city: 'London', name: 'London Heathrow', country: 'United Kingdom', lat: 51.47, lon: -0.4543 },
  { code: 'LGW', city: 'London', name: 'London Gatwick', country: 'United Kingdom', lat: 51.1537, lon: -0.1821 },
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland', lat: 53.4264, lon: -6.2499 },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas', country: 'Spain', lat: 40.4983, lon: -3.5676 },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona–El Prat', country: 'Spain', lat: 41.2974, lon: 2.0833 },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', country: 'Portugal', lat: 38.7742, lon: -9.1342 },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Kastrup', country: 'Denmark', lat: 55.618, lon: 12.656 },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin', country: 'Poland', lat: 52.1657, lon: 20.9671 },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt', country: 'Hungary', lat: 47.4298, lon: 19.2611 },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE', lat: 25.2532, lon: 55.3657 },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'United States', lat: 40.6413, lon: -73.7781 },
];

const BY_CODE = new Map(AIRPORTS.map((a) => [a.code, a]));

export function getAirport(code: string): Airport | undefined {
  return BY_CODE.get(code.toUpperCase());
}

/** "TIA – Tirana" */
export function airportLabel(code: string): string {
  const airport = getAirport(code);
  return airport ? `${airport.code} – ${airport.city}` : code;
}

/**
 * Autocomplete search. Exact code matches rank first, then code prefixes,
 * then city/name/country prefixes, then substring matches.
 */
export function searchAirports(query: string, limit = 20): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return AIRPORTS.slice(0, limit);

  const scored: { airport: Airport; score: number }[] = [];
  for (const airport of AIRPORTS) {
    const code = airport.code.toLowerCase();
    const city = airport.city.toLowerCase();
    const name = airport.name.toLowerCase();
    const country = airport.country.toLowerCase();
    let score = -1;
    if (code === q) score = 0;
    else if (code.startsWith(q)) score = 1;
    else if (city.startsWith(q)) score = 2;
    else if (name.startsWith(q) || country.startsWith(q)) score = 3;
    else if (city.includes(q) || name.includes(q) || country.includes(q)) score = 4;
    if (score >= 0) scored.push({ airport, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, limit)
    .map((s) => s.airport);
}
