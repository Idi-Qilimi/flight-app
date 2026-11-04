import { generateFlightsForDay, getFlightById, searchFlights } from '../services/flightGenerator';

describe('flightGenerator', () => {
  const params = { origin: 'TIA', destination: 'FCO', departureDate: '2026-10-12', returnDate: '2026-10-15' };

  it('is deterministic for the same route and date', () => {
    expect(generateFlightsForDay('TIA', 'FCO', '2026-10-12')).toEqual(generateFlightsForDay('TIA', 'FCO', '2026-10-12'));
  });

  it('returns 3–7 flights matching the requested route and date, sorted by departure', () => {
    const flights = generateFlightsForDay('TIA', 'FCO', '2026-10-12');
    expect(flights.length).toBeGreaterThanOrEqual(3);
    expect(flights.length).toBeLessThanOrEqual(7);
    for (const f of flights) {
      expect(f.origin).toBe('TIA');
      expect(f.destination).toBe('FCO');
      expect(f.departureTime.startsWith('2026-10-12')).toBe(true);
      expect(f.arrivalTime > f.departureTime).toBe(true);
    }
    const times = flights.map((f) => f.departureTime);
    expect(times).toEqual([...times].sort());
    expect(new Set(flights.map((f) => f.id)).size).toBe(flights.length);
  });

  it('returns no flights for identical or unknown airports and invalid dates', () => {
    expect(generateFlightsForDay('TIA', 'TIA', '2026-10-12')).toEqual([]);
    expect(generateFlightsForDay('XXX', 'FCO', '2026-10-12')).toEqual([]);
    expect(generateFlightsForDay('TIA', 'FCO', '2026-02-30')).toEqual([]);
  });

  it('searches outbound and the reversed return leg', () => {
    const { outbound, inbound } = searchFlights(params);
    expect(outbound.every((f) => f.origin === 'TIA' && f.departureTime.startsWith('2026-10-12'))).toBe(true);
    expect(inbound.every((f) => f.origin === 'FCO' && f.departureTime.startsWith('2026-10-15'))).toBe(true);
  });

  it('can rebuild any flight from its id', () => {
    const [flight] = generateFlightsForDay('ATH', 'LHR', '2026-12-01');
    expect(getFlightById(flight.id)).toEqual(flight);
    expect(getFlightById('nonsense')).toBeNull();
  });
});
