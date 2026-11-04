import { fireEvent, screen } from '@testing-library/react-native';
import FlightCard from '../components/FlightCard';
import RecentSearchItem from '../components/RecentSearchItem';
import SearchForm from '../components/SearchForm';
import { originChanged } from '../store/slices/searchFormSlice';
import { renderWithProviders, sampleFlight } from '../test-utils';

describe('FlightCard', () => {
  it('shows flight number, airline and times', async () => {
    await renderWithProviders(
      <FlightCard flight={sampleFlight} isFavorite={false} onPress={jest.fn()} onToggleFavorite={jest.fn()} />,
    );
    expect(screen.getByText('ITA Airways')).toBeTruthy();
    expect(screen.getByText('AZ573')).toBeTruthy();
    expect(screen.getByText('23:10')).toBeTruthy();
    expect(screen.getByText(/00:35/)).toBeTruthy();
    expect(screen.getByText(' +1')).toBeTruthy(); // arrives next day
    expect(screen.getByText('Delayed 20m')).toBeTruthy();
  });

  it('calls onPress and onToggleFavorite with the flight', async () => {
    const onPress = jest.fn();
    const onToggleFavorite = jest.fn();
    await renderWithProviders(
      <FlightCard flight={sampleFlight} isFavorite onPress={onPress} onToggleFavorite={onToggleFavorite} />,
    );
    await fireEvent.press(screen.getByTestId(`flight-card-${sampleFlight.id}`));
    expect(onPress).toHaveBeenCalledWith(sampleFlight);
    await fireEvent.press(screen.getByLabelText('Remove from favorites'));
    expect(onToggleFavorite).toHaveBeenCalledWith(sampleFlight);
  });
});

describe('RecentSearchItem', () => {
  it('renders the route + dates label and reports taps', async () => {
    const search = {
      id: '1',
      userId: '1',
      origin: 'TIA',
      destination: 'FCO',
      departureDate: '2026-10-12',
      returnDate: '2026-10-15',
      createdAt: '2026-10-01T00:00:00.000Z',
    };
    const onPress = jest.fn();
    await renderWithProviders(<RecentSearchItem search={search} onPress={onPress} />);
    expect(screen.getByText('TIA → FCO · 12 Oct – 15 Oct')).toBeTruthy();
    expect(screen.getByText('Tirana to Rome')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('recent-1'));
    expect(onPress).toHaveBeenCalledWith(search);
  });
});

describe('SearchForm', () => {
  it('submits the current form values', async () => {
    const onSubmit = jest.fn();
    const { store } = await renderWithProviders(<SearchForm onSubmit={onSubmit} />);
    await fireEvent.press(screen.getByTestId('search-button'));
    const { origin, destination, departureDate, returnDate } = store.getState().searchForm;
    expect(onSubmit).toHaveBeenCalledWith({ origin, destination, departureDate, returnDate });
  });

  it('blocks searching when origin equals destination', async () => {
    const onSubmit = jest.fn();
    const { store } = await renderWithProviders(<SearchForm onSubmit={onSubmit} />);
    store.dispatch(originChanged('FCO'));
    expect(await screen.findByText('Origin and destination cannot be the same')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('search-button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
