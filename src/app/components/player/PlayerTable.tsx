import { useState, useEffect } from 'react';
import { MIN_LOADING_MS } from '@/app/constants/loading';
import { Player } from '../../../types/player';
import { PlayerRemovalPermission } from '../../../types/room';
import { TrashIcon, ArrowLongUpIcon, ArrowLongDownIcon, ArrowsUpDownIcon, StarIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { MinusIcon, LockClosedIcon } from '@heroicons/react/16/solid';
import { formatRelativeTime } from '@/lib/playerActivity';
import { PresenceInfo } from '@/app/hooks/usePlayersPresence';

interface PlayerTableProps {
  initislSortDirection: string;
  roomOwnerId: string | undefined;
  currentPlayerId: string | null;
  players: Player[];
  revealVotes: boolean;
  removePlayer: (playerId: string) => void;
  playerRemovalPermissions?: PlayerRemovalPermission;
  spectatorIds?: string[];
  onToggleRole?: (playerId: string, currentlySpectator: boolean) => void;
  presence?: Record<string, PresenceInfo>;
}

type SortDirection = 'asc' | 'desc' | 'none';

const PlayerTable: React.FC<PlayerTableProps> = ({
  roomOwnerId,
  currentPlayerId,
  players,
  initislSortDirection,
  revealVotes,
  removePlayer,
  playerRemovalPermissions = 'host-only',
  spectatorIds = [],
  onToggleRole,
  presence = {},
}) => {
  const [sortDirection, setSortDirection] = useState<SortDirection>(initislSortDirection as SortDirection);
  const [sortedPlayers, setSortePlayers] = useState<Player[]>(players);
  const [isSpectatorsExpanded, setIsSpectatorsExpanded] = useState(false);

  const cycleSort = () => {
    const nextDirection: SortDirection =
      sortDirection === 'none' ? 'asc' : sortDirection === 'asc' ? 'desc' : 'none';
    setSortDirection(nextDirection);
    setSortePlayers(applySort([...players], nextDirection));
  };

  const applySort = (dataToSort: Player[], direction: SortDirection) => {
    const sorted = [...dataToSort];
    if (direction === 'asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (direction === 'desc') sorted.sort((a, b) => b.name.localeCompare(a.name));
    return sorted;
  };

  const getSortIcon = () => {
    if (sortDirection === 'asc') return <ArrowLongUpIcon className="h-5 w-5" />;
    if (sortDirection === 'desc') return <ArrowLongDownIcon className="h-5 w-5" />;
    return <ArrowsUpDownIcon className="h-5 w-5" />;
  };

  useEffect(() => {
    setSortePlayers(applySort(players, sortDirection));
  }, [players, sortDirection]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), MIN_LOADING_MS);
    return () => clearTimeout(timeout);
  }, []);

  // Keep "Last active Xm ago" tooltip text fresh without waiting for a presence update.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !players || players.length === 0) {
    const length = 3;
    return (
      <table className="table w-full max-w-4xl mx-auto overflow-x-auto rounded-lg">
        <thead>
          <tr>
            {Array.from({ length }).map((_, i) => (
              <th key={i}><div className="skeleton h-5 w-24"></div></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length }).map((_, j) => (
                <td key={j}><div className="skeleton h-5 w-full"></div></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const isHost = currentPlayerId === roomOwnerId;
  const voters = sortedPlayers.filter(p => !spectatorIds.includes(p.id));
  const spectators = sortedPlayers.filter(p => spectatorIds.includes(p.id));

  const renderPlayerRow = (player: Player) => {
    const isCurrentPlayer = player.id === currentPlayerId;
    const isPlayerHost = player.id === roomOwnerId;
    const isSpectator = spectatorIds.includes(player.id);

    const playerPresence = presence[player.id];
    const isOnline = playerPresence?.online ?? false;
    const lastActive = playerPresence?.lastChanged ?? player.lastJoinedAt;

    const canRemove = !isPlayerHost && !isCurrentPlayer && (
      playerRemovalPermissions === 'host-only' ? isHost : true
    );
    const canToggleRole = onToggleRole && (isCurrentPlayer || (isHost && !isPlayerHost));

    return (
      <tr key={player.id} className={`hover${isSpectator ? ' opacity-60' : ''}`}>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 tooltip tooltip-right ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
              data-tip={isOnline
                ? 'Online now'
                : `Last active ${formatRelativeTime(lastActive, now)}`}
            />
            {isPlayerHost && <StarIcon className="h-5 w-5 text-yellow-500" title="Room Host" />}
            <span>{player.name}</span>
          </div>
        </td>
        <td className="p-3">
          {isSpectator ? (
            <span><MinusIcon className="h-4 w-4 opacity-40" /></span>
          ) : player.selection === null || player.selection === undefined ? (
            <span><MinusIcon className="h-4 w-4" /></span>
          ) : revealVotes ? (
            <span className="font-bold">{player.selection}</span>
          ) : (
            <span><LockClosedIcon className="h-5 w-5" /></span>
          )}
        </td>
        <td className="p-1">
          <div className="flex items-center gap-1">
            {canRemove && (
              <button
                className="btn btn-danger"
                onClick={() => removePlayer(player.id)}
                title={playerRemovalPermissions === 'host-only' ? 'Remove player (Host only)' : 'Remove player'}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            {canToggleRole && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onToggleRole(player.id, isSpectator)}
                title={isSpectator ? 'Switch to Player' : 'Switch to Spectator'}
              >
                {isSpectator
                  ? <EyeSlashIcon className="h-5 w-5" />
                  : <EyeIcon className="h-5 w-5" />
                }
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-x-auto rounded-lg">
      <table className="table w-full border border-base-300 text-base">
        <thead>
          <tr className="bg-primary text-primary-content text-base">
            <th className="text-left p-0">
              <button onClick={cycleSort} className="flex items-center justify-between w-full h-full p-3">
                <span>Player</span>
                <span>{getSortIcon()}</span>
              </button>
            </th>
            <th className="text-left">Selection</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {voters.map(renderPlayerRow)}
        </tbody>
        {spectators.length > 0 && (
          <tbody>
            <tr
              className="cursor-pointer select-none border-t-2 border-base-300"
              onClick={() => setIsSpectatorsExpanded(prev => !prev)}
            >
              <td colSpan={3} className="px-3 py-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-semibold text-base-content/40">
                  {isSpectatorsExpanded
                    ? <ChevronUpIcon className="h-4 w-4" />
                    : <ChevronDownIcon className="h-4 w-4" />
                  }
                  Spectators <span className="badge badge-sm badge-ghost">{spectators.length}</span>
                </div>
              </td>
            </tr>
            {isSpectatorsExpanded && spectators.map(renderPlayerRow)}
          </tbody>
        )}
      </table>
    </div>
  );
};

export default PlayerTable;
