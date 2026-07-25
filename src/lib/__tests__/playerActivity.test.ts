import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '../playerActivity';

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  it('returns "just now" for a 0s diff', () => {
    expect(formatRelativeTime(now, now)).toBe('just now');
  });

  it('returns "just now" for a 30s diff', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 30_000), now)).toBe('just now');
  });

  it('returns "1m ago" at exactly 60s', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 60_000), now)).toBe('1m ago');
  });

  it('returns "45m ago" for a 45 minute diff', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 45 * 60_000), now)).toBe('45m ago');
  });

  it('returns "1h ago" at exactly 60 minutes', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 60 * 60_000), now)).toBe('1h ago');
  });

  it('returns "5h ago" for a 5 hour diff', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60 * 60_000), now)).toBe('5h ago');
  });

  it('returns "1d ago" at exactly 24 hours', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 24 * 60 * 60_000), now)).toBe('1d ago');
  });

  it('returns "3d ago" for a 3 day diff', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 24 * 60 * 60_000), now)).toBe('3d ago');
  });

  it('clamps future timestamps (clock skew) to "just now"', () => {
    expect(formatRelativeTime(new Date(now.getTime() + 60_000), now)).toBe('just now');
  });
});
