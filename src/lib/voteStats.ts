import { Player } from '@/types/player';

const STORY_POINTS = [0, 1, 2, 3, 5, 8, 13, 21];

export interface VoteStats {
  recommended: number | null;
  min: number | null;
  max: number | null;
  consensus: 'unanimous' | 'close' | 'split' | 'none';
  numericVoteCount: number;
  totalPlayerCount: number;
}

function nearestStoryPoint(value: number): number {
  return STORY_POINTS.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

export function calculateVoteStats(players: Player[], spectatorIds: string[] = []): VoteStats {
  const voters = players.filter(p => !spectatorIds.includes(p.id));
  const numericVotes = voters
    .map(p => p.selection)
    .filter((s): s is number => typeof s === 'number');

  const totalPlayerCount = voters.length;
  const numericVoteCount = numericVotes.length;

  if (numericVoteCount === 0) {
    return { recommended: null, min: null, max: null, consensus: 'none', numericVoteCount, totalPlayerCount: voters.length };
  }

  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);
  const average = numericVotes.reduce((sum, v) => sum + v, 0) / numericVoteCount;
  const recommended = nearestStoryPoint(average);

  let consensus: VoteStats['consensus'];
  if (min === max) {
    consensus = 'unanimous';
  } else if (max - min <= 2) {
    consensus = 'close';
  } else {
    consensus = 'split';
  }

  return { recommended, min, max, consensus, numericVoteCount, totalPlayerCount };
}
