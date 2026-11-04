import { searchAirports } from '../data/airports';
import { addDays, formatShortDate, isValidISODate } from '../utils/dates';
import {
  SAME_AIRPORT_ERROR,
  applyRecentSearchRules,
  formatSearchLabel,
  validateSearch,
} from '../utils/search';

const today = '2026-10-01';
const valid = { origin: 'TIA', destination: 'FCO', departureDate: '2026-10-12', returnDate: '2026-10-15' };

describe('validateSearch', () => {
  it('accepts a valid search', () => {
    expect(validateSearch(valid, today)).toEqual({});
  });

  it('rejects identical origin and destination', () => {
    expect(validateSearch({ ...valid, destination: 'TIA' }, today).destination).toBe(SAME_AIRPORT_ERROR);
  });

  it('requires both airports', () => {
    const errors = validateSearch({ ...valid, origin: null, destination: null }, today);
    expect(errors.origin).toBeDefined();
    expect(errors.destination).toBeDefined();
  });

  it('rejects past departures and returns before departure', () => {
    const errors = validateSearch({ ...valid, departureDate: '2026-09-30', returnDate: '2026-09-29' }, today);
    expect(errors.departureDate).toMatch(/past/);
    expect(errors.returnDate).toMatch(/after departure/);
  });
});

describe('formatSearchLabel', () => {
  it('matches the "TIA → FCO · 12 Oct – 15 Oct" format', () => {
    expect(formatSearchLabel(valid)).toBe('TIA → FCO · 12 Oct – 15 Oct');
  });
});

describe('applyRecentSearchRules', () => {
  const make = (i: number, overrides = {}) => ({
    ...valid,
    departureDate: addDays('2026-10-12', i),
    id: String(i),
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
    ...overrides,
  });

  it('orders newest first and caps the list', () => {
    const items = Array.from({ length: 13 }, (_, i) => make(i));
    const { keep, remove } = applyRecentSearchRules(items, 10);
    expect(keep).toHaveLength(10);
    expect(keep[0].id).toBe('12');
    expect(remove.sort()).toEqual(['0', '1', '2']);
  });

  it('drops older duplicates of the same search', () => {
    const older = make(1, { departureDate: '2026-10-12' });
    const newer = make(5, { departureDate: '2026-10-12' });
    const { keep, remove } = applyRecentSearchRules([older, newer]);
    expect(keep.map((k) => k.id)).toEqual(['5']);
    expect(remove).toEqual(['1']);
  });
});

describe('dates', () => {
  it('handles month boundaries and invalid dates', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(formatShortDate('2026-10-05')).toBe('5 Oct');
    expect(isValidISODate('2026-02-29')).toBe(false);
    expect(isValidISODate('2028-02-29')).toBe(true);
  });
});

describe('searchAirports (autocomplete)', () => {
  it('ranks exact code matches first', () => {
    expect(searchAirports('fco')[0].code).toBe('FCO');
  });

  it('matches by city name', () => {
    expect(searchAirports('rom').map((a) => a.code)).toEqual(expect.arrayContaining(['FCO', 'CIA']));
    expect(searchAirports('tira')[0].code).toBe('TIA');
  });
});
