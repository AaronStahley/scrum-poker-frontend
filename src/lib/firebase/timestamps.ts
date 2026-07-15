import { Timestamp } from 'firebase/firestore';

/**
 * Firestore returns Timestamp objects for any field written as a JS Date
 * (or serverTimestamp()), even though types like Player declare those
 * fields as `Date`. Normalizes either shape into a real Date; falls back
 * to the epoch for missing/malformed values rather than throwing.
 */
export function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as Timestamp).toDate();
  }
  return new Date(0);
}
