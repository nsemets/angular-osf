import { HttpErrorResponse } from '@angular/common/http';

import type { ErrorEvent, EventHint } from '@sentry/angular';

export const SENTRY_IGNORE_ERRORS: (string | RegExp)[] = [
  'Handled unknown error',
  'Non-Error promise rejection captured',
  'no elements in sequence',
  /ResizeObserver loop/,
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Failed to fetch',
  'Load failed',
  'NetworkError when attempting to fetch resource',
  'AbortError',
  'The operation was aborted',
  'The user aborted a request',
  'ChunkLoadError',
  /Loading chunk [\w.-]+ failed/,
  'Beacon is not defined',
];

export const SENTRY_DENY_URLS: (string | RegExp)[] = [
  /extensions\//i,
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /^safari-extension:\/\//i,
  /^safari-web-extension:\/\//i,
  /^ms-browser-extension:\/\//i,
];

const MIN_REPORTED_STATUS = 500;
const MAX_UNWRAP_DEPTH = 4;

const STATUS_MESSAGE_PATTERNS = [
  /Http failure response for .*: (\d{1,3})(?:\s|$)/,
  /Server returned code (\d{1,3})(?:\s|$)/,
];

const CAPTURED_OBJECT_KEYS = /(?:Object captured as exception|Non-Error exception captured) with keys: (.+)/;

const WRAPPER_KEYS = ['ngOriginalError', 'rejection', 'cause'] as const;
const HTTP_RESPONSE_KEYS = ['url', 'statusText', 'headers', 'ok'] as const;

function isHttpResponseLike(value: object): value is { status: number } {
  const hasNumericStatus = 'status' in value && typeof (value as { status: unknown }).status === 'number';

  return hasNumericStatus && HTTP_RESPONSE_KEYS.some((key) => key in value);
}

function describesHttpResponse(message: string | undefined): boolean {
  const keys = message
    ?.match(CAPTURED_OBJECT_KEYS)?.[1]
    .split(',')
    .map((key) => key.trim());

  if (!keys?.includes('status')) {
    return false;
  }

  return HTTP_RESPONSE_KEYS.some((key) => keys.includes(key));
}

function getStatusFromMessage(message: string | undefined): number | null {
  if (!message) {
    return null;
  }

  for (const pattern of STATUS_MESSAGE_PATTERNS) {
    const match = message.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

function getStatusFromError(error: unknown, depth = 0): number | null {
  if (error instanceof HttpErrorResponse) {
    return error.status;
  }

  if (typeof error === 'string') {
    return getStatusFromMessage(error);
  }

  if (!error || typeof error !== 'object') {
    return null;
  }

  if (isHttpResponseLike(error)) {
    return error.status;
  }

  if (depth >= MAX_UNWRAP_DEPTH) {
    return null;
  }

  for (const key of WRAPPER_KEYS) {
    const status = getStatusFromError((error as Record<string, unknown>)[key], depth + 1);

    if (status !== null) {
      return status;
    }
  }

  return null;
}

function getErrorMessage(error: unknown, event: ErrorEvent): string | undefined {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  const values = event.exception?.values;

  return values?.[values.length - 1]?.value;
}

function getStatusFromSerialized(event: ErrorEvent, message: string | undefined): number | null {
  const serialized = event.extra?.['__serialized__'];

  if (!serialized || typeof serialized !== 'object') {
    return null;
  }

  const status = 'status' in serialized ? serialized.status : null;

  if (typeof status === 'number' && (isHttpResponseLike(serialized) || describesHttpResponse(message))) {
    return status;
  }

  if ('message' in serialized && typeof serialized.message === 'string') {
    return getStatusFromMessage(serialized.message);
  }

  return null;
}

function resolveHttpStatus(error: unknown, event: ErrorEvent): number | null {
  const message = getErrorMessage(error, event);

  return getStatusFromError(error) ?? getStatusFromSerialized(event, message) ?? getStatusFromMessage(message);
}

export function sentryBeforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
  const status = resolveHttpStatus(hint.originalException, event);
  const isReportable = status === null || status >= MIN_REPORTED_STATUS;

  return isReportable ? event : null;
}
