import { describe, it, expect, vi } from 'vitest';

// The global test setup mocks firebase/firestore without a Timestamp export;
// this file exercises the real Timestamp class, so use the actual module.
vi.unmock('firebase/firestore');

const { Timestamp } = await import('firebase/firestore');
const { toDate } = await import('../timestamps');

describe('toDate', () => {
  it('passes through a real Date unchanged', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    expect(toDate(date)).toBe(date);
  });

  it('converts a Firestore Timestamp to an equivalent Date', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const timestamp = Timestamp.fromDate(date);
    expect(toDate(timestamp).getTime()).toBe(date.getTime());
  });

  it('falls back to the epoch for undefined', () => {
    expect(toDate(undefined).getTime()).toBe(0);
  });

  it('falls back to the epoch for null', () => {
    expect(toDate(null).getTime()).toBe(0);
  });

  it('converts a duck-typed timestamp-like object', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const ducked = { toDate: () => date };
    expect(toDate(ducked)).toBe(date);
  });
});
