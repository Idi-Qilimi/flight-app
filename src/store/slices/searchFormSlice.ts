import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ISODate, SearchParams } from '../../types/models';
import { addDays, todayISO } from '../../utils/dates';
import type { SearchDraft } from '../../utils/search';

export type SearchFormState = SearchDraft;

export function createInitialSearchForm(today: ISODate = todayISO()): SearchFormState {
  return {
    origin: 'TIA',
    destination: 'FCO',
    departureDate: addDays(today, 7),
    returnDate: addDays(today, 10),
  };
}

const searchFormSlice = createSlice({
  name: 'searchForm',
  initialState: () => createInitialSearchForm(),
  reducers: {
    originChanged: (state, action: PayloadAction<string>) => {
      state.origin = action.payload;
    },
    destinationChanged: (state, action: PayloadAction<string>) => {
      state.destination = action.payload;
    },
    airportsSwapped: (state) => {
      [state.origin, state.destination] = [state.destination, state.origin];
    },
    departureDateChanged: (state, action: PayloadAction<ISODate>) => {
      state.departureDate = action.payload;
      // Keep the trip length valid: push the return date forward if needed.
      if (state.returnDate < action.payload) state.returnDate = action.payload;
    },
    returnDateChanged: (state, action: PayloadAction<ISODate>) => {
      state.returnDate = action.payload;
    },
    /** Tapping a recent search pre-fills the whole form. */
    prefilled: (_state, action: PayloadAction<SearchParams>) => {
      const { origin, destination, departureDate, returnDate } = action.payload;
      return { origin, destination, departureDate, returnDate };
    },
    reset: () => createInitialSearchForm(),
  },
});

export const {
  originChanged,
  destinationChanged,
  airportsSwapped,
  departureDateChanged,
  returnDateChanged,
  prefilled,
  reset: searchFormReset,
} = searchFormSlice.actions;
export default searchFormSlice.reducer;
