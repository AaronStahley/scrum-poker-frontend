import { Player } from '@/types/player';
import { CardSequenceType } from '@/types/room';
import {
  getCardSequenceConfig,
  getOrderedValues,
  getNumericValues,
  DEFAULT_CARD_SEQUENCE,
} from './cardSequences';

export interface VoteStats {
  recommended: number | null;
  min: number | string | null;
  max: number | string | null;
  consensus: 'unanimous' | 'close' | 'split' | 'none';
  numericVoteCount: number;
  totalPlayerCount: number;
  hasNonNumericVotes: boolean;
  isNumericSequence: boolean;
}

const CLOSE_INDEX_DISTANCE = 1;

function nearestValue(values: number[], target: number): number {
  return values.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}

function closestIndex(
  orderedValues: (number | string)[],
  vote: number | string,
  isNumeric: boolean
): number {
  if (!isNumeric) {
    const exact = orderedValues.indexOf(vote);
    return exact === -1 ? 0 : exact;
  }
  if (typeof vote !== 'number') return 0;
  const numericValues = orderedValues.filter((v): v is number => typeof v === 'number');
  const nearest = nearestValue(numericValues, vote);
  return orderedValues.indexOf(nearest);
}

export function calculateVoteStats(
  players: Player[],
  spectatorIds: string[] = [],
  cardSequence: CardSequenceType = DEFAULT_CARD_SEQUENCE
): VoteStats {
  const config = getCardSequenceConfig(cardSequence);
  const orderedValues = getOrderedValues(config);

  const voters = players.filter((p) => !spectatorIds.includes(p.id));
  const totalPlayerCount = voters.length;

  const countedVotes = voters
    .map((p) => p.selection)
    .filter((s): s is number | string => s !== null && s !== undefined && s !== '?');
  const hasNonNumericVotes = voters.some((p) => p.selection === '?');
  const numericVoteCount = countedVotes.length;

  if (numericVoteCount === 0) {
    return {
      recommended: null,
      min: null,
      max: null,
      consensus: 'none',
      numericVoteCount,
      totalPlayerCount,
      hasNonNumericVotes,
      isNumericSequence: config.isNumeric,
    };
  }

  const indices = countedVotes.map((v) => closestIndex(orderedValues, v, config.isNumeric));
  const minIndex = Math.min(...indices);
  const maxIndex = Math.max(...indices);
  const min = orderedValues[minIndex];
  const max = orderedValues[maxIndex];

  let recommended: number | null = null;
  if (config.isNumeric) {
    const numericVotes = countedVotes.filter((v): v is number => typeof v === 'number');
    if (numericVotes.length > 0) {
      const average = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;
      recommended = nearestValue(getNumericValues(config), average);
    }
  }

  const distance = maxIndex - minIndex;
  const consensus: VoteStats['consensus'] =
    distance === 0 ? 'unanimous' : distance <= CLOSE_INDEX_DISTANCE ? 'close' : 'split';

  return {
    recommended,
    min,
    max,
    consensus,
    numericVoteCount,
    totalPlayerCount,
    hasNonNumericVotes,
    isNumericSequence: config.isNumeric,
  };
}
