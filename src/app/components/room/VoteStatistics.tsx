'use client';

import { Player } from '@/types/player';
import { CardSequenceType } from '@/types/room';
import { calculateVoteStats } from '@/lib/voteStats';
import { formatCardValue } from '@/lib/cardSequences';

interface VoteStatisticsProps {
  players: Player[];
  spectatorIds?: string[];
  cardSequence?: CardSequenceType;
}

const consensusConfig = {
  unanimous: { label: 'Unanimous', className: 'badge-success' },
  close: { label: 'Close', className: 'badge-warning' },
  split: { label: 'Split', className: 'badge-error' },
  none: { label: 'No votes', className: 'badge-neutral' },
};

const VoteStatistics: React.FC<VoteStatisticsProps> = ({ players, spectatorIds = [], cardSequence }) => {
  const { recommended, min, max, consensus, numericVoteCount, totalPlayerCount, hasNonNumericVotes, isNumericSequence } = calculateVoteStats(players, spectatorIds, cardSequence);

  const { label, className } = consensusConfig[consensus];
  const display = (value: number | string) => formatCardValue(cardSequence, value);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-base-200 rounded-lg mx-6">
      {isNumericSequence && (
        <>
          <div className="tooltip tooltip-bottom" data-tip="Nearest card to the average of all numeric votes">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {recommended !== null ? display(recommended) : '—'}
              </div>
              <div className="text-xs text-base-content/60 uppercase tracking-wide">
                Recommended
              </div>
            </div>
          </div>

          <div className="divider divider-horizontal m-0 h-10 self-center" />
        </>
      )}

      <div className="tooltip tooltip-bottom" data-tip="The lowest and highest votes cast">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {min !== null && max !== null
              ? (min === max ? display(min) : `${display(min)} – ${display(max)}`)
              : '—'}
          </div>
          <div className="text-xs text-base-content/60 uppercase tracking-wide">
            Range
          </div>
        </div>
      </div>

      <div className="divider divider-horizontal m-0 h-10 self-center" />

      <div className="tooltip tooltip-bottom" data-tip="Unanimous: same card · Close: adjacent cards · Split: farther apart">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <span className={`badge ${className} badge-lg font-semibold`}>{label}</span>
          </div>
          <div className="text-xs text-base-content/60 uppercase tracking-wide">
            {numericVoteCount} of {totalPlayerCount} {hasNonNumericVotes ? (isNumericSequence ? 'numeric' : 'valid') : 'voted'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteStatistics;
