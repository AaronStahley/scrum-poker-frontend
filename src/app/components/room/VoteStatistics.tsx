'use client';

import { Player } from '@/types/player';
import { calculateVoteStats } from '@/lib/voteStats';

interface VoteStatisticsProps {
  players: Player[];
}

const consensusConfig = {
  unanimous: { label: 'Unanimous', className: 'badge-success' },
  close: { label: 'Close', className: 'badge-warning' },
  split: { label: 'Split', className: 'badge-error' },
  none: { label: 'No votes', className: 'badge-neutral' },
};

const VoteStatistics: React.FC<VoteStatisticsProps> = ({ players }) => {
  const { recommended, min, max, consensus, numericVoteCount, totalPlayerCount } = calculateVoteStats(players);

  const { label, className } = consensusConfig[consensus];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-base-200 rounded-lg mx-6">
      <div className="tooltip tooltip-bottom" data-tip="Nearest story point to the average of all numeric votes">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {recommended !== null ? recommended : '—'}
          </div>
          <div className="text-xs text-base-content/60 uppercase tracking-wide">
            Recommended
          </div>
        </div>
      </div>

      <div className="divider divider-horizontal m-0 h-10 self-center" />

      <div className="tooltip tooltip-bottom" data-tip="The lowest and highest numeric votes cast">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {min !== null && max !== null ? (min === max ? `${min}` : `${min} – ${max}`) : '—'}
          </div>
          <div className="text-xs text-base-content/60 uppercase tracking-wide">
            Range
          </div>
        </div>
      </div>

      <div className="divider divider-horizontal m-0 h-10 self-center" />

      <div className="tooltip tooltip-bottom" data-tip="Unanimous: all votes match · Close: range ≤ 2 · Split: range > 2">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <span className={`badge ${className} badge-lg font-semibold`}>{label}</span>
          </div>
          <div className="text-xs text-base-content/60 uppercase tracking-wide">
            {numericVoteCount} of {totalPlayerCount} voted
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteStatistics;
