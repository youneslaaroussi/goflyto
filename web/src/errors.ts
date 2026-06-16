// Error types mirror the FastAPI ErrorBody schema in goflyto/api/errors.py.
// The server owns classification — we just read the code.

export type AppErrorCode =
  | 'NO_FLIGHTS_FOUND'
  | 'SEARCH_TIMEOUT'
  | 'NETWORK_OFFLINE'
  | 'AI_PARSE_FAILED'
  | 'INVALID_ROUTE'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode;
  message: string;
  hint: string;
  retryable: boolean;
}

// Fallback for when the network itself fails (no response body possible)
export const NETWORK_ERROR: AppError = {
  code: 'NETWORK_OFFLINE',
  message: 'No internet connection',
  hint: 'Check your Wi-Fi or mobile data and try again.',
  retryable: true,
};

export const UNKNOWN_ERROR: AppError = {
  code: 'UNKNOWN',
  message: 'Something went wrong',
  hint: 'Please try again. If the problem persists, check back later.',
  retryable: true,
};
