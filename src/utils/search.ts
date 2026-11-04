import type { ISODate, SearchParams } from '../types/models';
import { getAirport } from '../data/airports';
import { formatShortDate, isValidISODate } from './dates';

export type SearchField = keyof SearchParams;
export type SearchErrors = Partial<Record<SearchField, string>>;

/** Shape of the form while it is being edited – airports may still be unset. */
export interface SearchDraft {
  origin: string | null;
  destination: string | null;
  departureDate: ISODate;
  returnDate: ISODate;
}

export const SAME_AIRPORT_ERROR = 'Origin and destination cannot be the same';

export function validateSearch(draft: SearchDraft, today: ISODate): SearchErrors {
  const errors: SearchErrors = {};

  if (!draft.origin) errors.origin = 'Choose where you are flying from';
  else if (!getAirport(draft.origin)) errors.origin = 'Unknown airport';

  if (!draft.destination) errors.destination = 'Choose where you are flying to';
  else if (!getAirport(draft.destination)) errors.destination = 'Unknown airport';

  if (draft.origin && draft.destination && draft.origin === draft.destination) {
    errors.destination = SAME_AIRPORT_ERROR;
  }

  if (!isValidISODate(draft.departureDate)) errors.departureDate = 'Pick a departure date';
  else if (draft.departureDate < today) errors.departureDate = 'Departure cannot be in the past';

  if (!isValidISODate(draft.returnDate)) errors.returnDate = 'Pick a return date';
  else if (draft.returnDate < draft.departureDate) {
    errors.returnDate = 'Return must be on or after departure';
  }

  return errors;
}

export function isSearchValid(draft: SearchDraft, today: ISODate): draft is SearchParams & SearchDraft {
  return Object.keys(validateSearch(draft, today)).length === 0;
}

/** "TIA → FCO · 12 Oct – 15 Oct" */
export function formatSearchLabel(search: SearchParams): string {
  return `${search.origin} → ${search.destination} · ${formatShortDate(search.departureDate)} – ${formatShortDate(search.returnDate)}`;
}

export function isSameSearch(a: SearchParams, b: SearchParams): boolean {
  return (
    a.origin === b.origin &&
    a.destination === b.destination &&
    a.departureDate === b.departureDate &&
    a.returnDate === b.returnDate
  );
}

export const MAX_RECENT_SEARCHES = 10;

/**
 * Pure rule for the recent-searches list: newest first, de-duplicated, capped.
 * Returns the items to keep and the ids that should be deleted on the server.
 */
export function applyRecentSearchRules<T extends SearchParams & { id: string; createdAt: string }>(
  items: T[],
  max = MAX_RECENT_SEARCHES,
): { keep: T[]; remove: string[] } {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const keep: T[] = [];
  const remove: string[] = [];
  for (const item of sorted) {
    if (keep.length >= max || keep.some((k) => isSameSearch(k, item))) remove.push(item.id);
    else keep.push(item);
  }
  return { keep, remove };
}
