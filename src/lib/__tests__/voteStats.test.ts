import { describe, it, expect } from 'vitest';
import { calculateVoteStats } from '../voteStats';
import { Player } from '@/types/player';

const makePlayer = (id: string, selection: number | string | null): Player => ({
  id,
  name: `Player ${id}`,
  selection,
  currentRoom: 'room1',
  lastJoinedAt: new Date(),
  createdAt: new Date(),
});

describe('calculateVoteStats', () => {
  it('returns nulls and none consensus when no players have voted', () => {
    const players = [makePlayer('1', null), makePlayer('2', null)];
    const stats = calculateVoteStats(players);
    expect(stats.recommended).toBeNull();
    expect(stats.min).toBeNull();
    expect(stats.max).toBeNull();
    expect(stats.consensus).toBe('none');
    expect(stats.numericVoteCount).toBe(0);
    expect(stats.totalPlayerCount).toBe(2);
  });

  it('returns nulls and none consensus when only "?" votes exist', () => {
    const players = [makePlayer('1', '?'), makePlayer('2', '?')];
    const stats = calculateVoteStats(players);
    expect(stats.recommended).toBeNull();
    expect(stats.consensus).toBe('none');
  });

  it('snaps average to nearest story point', () => {
    // average 5.33 → nearest is 5
    const players = [makePlayer('1', 3), makePlayer('2', 5), makePlayer('3', 8)];
    expect(calculateVoteStats(players).recommended).toBe(5);
  });

  it('snaps average of 4.5 to nearest story point (5)', () => {
    const players = [makePlayer('1', 3), makePlayer('2', 5), makePlayer('3', 5)];
    expect(calculateVoteStats(players).recommended).toBe(5);
  });

  it('snaps average to nearest story point (8)', () => {
    // 8, 8, 5 → average 7 → nearest is 8
    const players = [makePlayer('1', 8), makePlayer('2', 8), makePlayer('3', 5)];
    expect(calculateVoteStats(players).recommended).toBe(8);
  });

  it('returns unanimous consensus when all votes are identical', () => {
    const players = [makePlayer('1', 5), makePlayer('2', 5), makePlayer('3', 5)];
    const stats = calculateVoteStats(players);
    expect(stats.consensus).toBe('unanimous');
    expect(stats.min).toBe(5);
    expect(stats.max).toBe(5);
  });

  it('returns close consensus when range is 2 or less', () => {
    const players = [makePlayer('1', 3), makePlayer('2', 5)];
    expect(calculateVoteStats(players).consensus).toBe('close');
  });

  it('returns split consensus when range is greater than 2', () => {
    const players = [makePlayer('1', 1), makePlayer('2', 8)];
    expect(calculateVoteStats(players).consensus).toBe('split');
  });

  it('excludes null and "?" votes from calculations', () => {
    // numeric votes: 5, 5, 3 → average 4.33 → nearest is 5
    const players = [makePlayer('1', 5), makePlayer('2', null), makePlayer('3', '?'), makePlayer('4', 5), makePlayer('5', 3)];
    const stats = calculateVoteStats(players);
    expect(stats.numericVoteCount).toBe(3);
    expect(stats.totalPlayerCount).toBe(5);
    expect(stats.recommended).toBe(5);
  });

  it('excludes spectators from all calculations', () => {
    const players = [makePlayer('1', 8), makePlayer('2', 5), makePlayer('spectator1', 3)];
    const stats = calculateVoteStats(players, ['spectator1']);
    expect(stats.totalPlayerCount).toBe(2);
    expect(stats.numericVoteCount).toBe(2);
    // average of 8 and 5 is 6.5 → nearest story point is 5
    expect(stats.recommended).toBe(5);
  });

  it('returns none consensus when all participants are spectators', () => {
    const players = [makePlayer('1', 5)];
    const stats = calculateVoteStats(players, ['1']);
    expect(stats.recommended).toBeNull();
    expect(stats.consensus).toBe('none');
    expect(stats.totalPlayerCount).toBe(0);
  });

  it('handles a single voter', () => {
    const players = [makePlayer('1', 8)];
    const stats = calculateVoteStats(players);
    expect(stats.recommended).toBe(8);
    expect(stats.min).toBe(8);
    expect(stats.max).toBe(8);
    expect(stats.consensus).toBe('unanimous');
  });

  it('handles empty player list', () => {
    const stats = calculateVoteStats([]);
    expect(stats.recommended).toBeNull();
    expect(stats.consensus).toBe('none');
    expect(stats.totalPlayerCount).toBe(0);
  });
});
