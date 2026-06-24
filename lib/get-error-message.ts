import axios, { AxiosError } from 'axios';
import { isPlanInactiveError } from './plan-inactive';

type ApiErrorBody = {
  message?: string | string[] | Record<string, unknown>;
  error?: string;
  errors?: Array<string | { field?: string; message?: string }>;
  statusCode?: number;
};

export type ApiFieldError = {
  field: string;
  message: string;
  code?: string;
  action?: string;
};

function collectStructuredErrors(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return trimmed ? { field: 'global', message: trimmed } : null;
      }

      if (item && typeof item === 'object' && 'message' in item) {
        const message =
          typeof item.message === 'string' ? item.message.trim() : '';
        if (!message) return null;

        const field =
          typeof item.field === 'string' && item.field.trim()
            ? item.field.trim()
            : 'global';
        const code =
          typeof item.code === 'string' && item.code.trim()
            ? item.code.trim()
            : undefined;
        const action =
          typeof item.action === 'string' && item.action.trim()
            ? item.action.trim()
            : undefined;

        return { field, message, code, action };
      }

      return null;
    })
    .filter((item): item is ApiFieldError => Boolean(item));
}

function extractErrorsFromApiBody(data: ApiErrorBody | undefined): ApiFieldError[] {
  if (!data) return [];

  const fromTopLevel = collectStructuredErrors(data.errors);
  if (fromTopLevel.length > 0) {
    return fromTopLevel;
  }

  if (data.message && typeof data.message === 'object' && !Array.isArray(data.message)) {
    const nested = data.message as ApiErrorBody;
    const fromNested = collectStructuredErrors(nested.errors);
    if (fromNested.length > 0) {
      return fromNested;
    }
  }

  const fromMessageArray = collectStructuredErrors(data.message);
  if (fromMessageArray.length > 0) {
    return fromMessageArray;
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return [{ field: 'global', message: data.message.trim() }];
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return [{ field: 'global', message: data.error.trim() }];
  }

  return [];
}

export function extractApiFieldErrors(error: unknown): ApiFieldError[] {
  if (!error) return [];

  if (isPlanInactiveError(error)) {
    return [{ field: 'global', message: error.message || 'Subscription required' }];
  }

  if (axios.isAxiosError(error)) {
    return extractErrorsFromApiBody(error.response?.data as ApiErrorBody | undefined);
  }

  if (error instanceof Error) {
    const message = error.message?.trim();
    return message ? [{ field: 'global', message }] : [];
  }

  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed ? [{ field: 'global', message: trimmed }] : [];
  }

  return [];
}

const CHUNK_LOAD_PATTERN =
  /loading chunk|chunkloaderror|failed to fetch dynamically imported module|_next\/static\/chunks/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = String((error as { name?: string }).name || '');
    if (/chunkloaderror/i.test(name)) return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_LOAD_PATTERN.test(message);
}

export function sanitizeErrorMessage(
  message: string | null | undefined,
  fallback: string,
): string {
  const trimmed = (message || '').trim();
  if (!trimmed || trimmed === '[object Object]') return fallback;
  if (CHUNK_LOAD_PATTERN.test(trimmed)) {
    return 'The app was updated. Please refresh the page and try again.';
  }
  return trimmed;
}

function formatFieldMessage(item: {
  field?: string;
  message?: string;
  action?: string;
}): string | null {
  const message = typeof item.message === 'string' ? item.message.trim() : '';
  if (!message) return null;

  const action = typeof item.action === 'string' ? item.action.trim() : '';
  if (action) {
    return `${message} ${action}`;
  }

  const field = typeof item.field === 'string' ? item.field.trim() : '';
  if (field && field !== 'global') {
    return `${message}`;
  }

  return message;
}

export function formatApiFieldErrorsForDisplay(errors: ApiFieldError[]): string {
  if (!errors.length) return '';

  return errors
    .map((item) => formatFieldMessage(item))
    .filter((item): item is string => Boolean(item))
    .join(' ');
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
      return sanitizeErrorMessage(axiosError.message, 'Unable to connect to the server.');
    }

    const fromBody = extractFromApiBody(axiosError.response.data);
    if (fromBody) return sanitizeErrorMessage(fromBody, fallback);

    const status = axiosError.response.status;
    if (status === 401) return 'Session expired. Please sign in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return 'Server error. Please try again later.';

    return sanitizeErrorMessage(axiosError.message, fallback);
  }

  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message, fallback);
  }

  if (typeof error === 'string') {
    return sanitizeErrorMessage(error, fallback);
  }

  return fallback;
}
