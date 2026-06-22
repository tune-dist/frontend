import axios, { AxiosError } from 'axios';
import { isPlanInactiveError } from './plan-inactive';

type ApiErrorBody = {
  message?: string | string[] | Record<string, unknown>;
  error?: string;
  errors?: Array<string | { field?: string; message?: string }>;
  statusCode?: number;
};

function formatFieldMessage(item: { field?: string; message?: string }): string | null {
  const message = typeof item.message === 'string' ? item.message.trim() : '';
  if (!message) return null;

  const field = typeof item.field === 'string' ? item.field.trim() : '';
  return field ? `${field}: ${message}` : message;
}

function stringifyMessages(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const parts = value
    .map((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return trimmed || null;
      }

      if (item && typeof item === 'object' && 'message' in item) {
        return formatFieldMessage(item as { field?: string; message?: string });
      }

      return null;
    })
    .filter((item): item is string => Boolean(item));

  return parts.length ? parts.join('. ') : null;
}

function extractFromApiBody(data: ApiErrorBody | undefined): string | null {
  if (!data) return null;

  const fromMessage = stringifyMessages(data.message);
  if (fromMessage) return fromMessage;

  if (typeof data.error === 'string') {
    const trimmed = data.error.trim();
    if (trimmed) return trimmed;
  }

  const fromErrors = stringifyMessages(data.errors);
  if (fromErrors) return fromErrors;

  // Nest may return { errors: [...] } without a top-level message string.
  if (data.message && typeof data.message === 'object' && !Array.isArray(data.message)) {
    const nested = data.message as ApiErrorBody;
    const nestedErrors = stringifyMessages(nested.errors);
    if (nestedErrors) return nestedErrors;
  }

  return null;
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) return fallback;

  if (isPlanInactiveError(error)) {
    return error.message || 'Subscription required';
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;

    if (!axiosError.response) {
      if (axiosError.code === 'ERR_NETWORK') {
        return 'Network error. Please check your connection and ensure the server is running.';
      }
      return axiosError.message || 'Unable to connect to the server.';
    }

    const fromBody = extractFromApiBody(axiosError.response.data);
    if (fromBody) return fromBody;

    const status = axiosError.response.status;
    if (status === 401) return 'Session expired. Please sign in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return 'Server error. Please try again later.';

    return axiosError.message || fallback;
  }

  if (error instanceof Error) {
    const message = error.message?.trim();
    if (message) return message;
  }

  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed || fallback;
  }

  return fallback;
}
