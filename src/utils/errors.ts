import { API_URL } from '../api/config';

/** Turns RTK Query / thrown errors into a human-readable message. */
export function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Something went wrong';

  if ('status' in error) {
    const { status } = error as { status: unknown; error?: unknown };
    if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
      return `Can't reach the server at ${API_URL}. Is json-server running (npm run server)?`;
    }
    if ((status === 'CUSTOM_ERROR' || status === 'PARSING_ERROR') && 'error' in error) {
      return String((error as { error: unknown }).error);
    }
    if (typeof status === 'number') return `Server error (${status})`;
  }

  if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Something went wrong';
}
