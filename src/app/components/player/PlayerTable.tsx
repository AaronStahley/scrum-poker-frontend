import { useState, useEffect } from 'react';
import { Player } from '../../../types/player';
import { PlayerRemovalPermission } from '../../../types/room';
import { TrashIcon, ArrowLongUpIcon, ArrowLongDownIcon, ArrowsUpDownIcon, StarIcon } from '@heroicons/react/20/solid';
import { MinusIcon, LockClosedIcon } from '@heroicons/react/16/solid';

interface PlayerTableProps {
  initislSortDirection: string;
  roomOwnerId: string | undefined;
  currentPlayerId: string | null;
  players: Player[];
  revealVotes: boolean;
  removePlayer: (playerName: string) => void;
  playerRemovalPermissions?: PlayerRemovalPermission;
}

type SortDirection = 'asc' | 'desc' | 'none';

const PlayerTable: React.FC<PlayerTableProps> = ({ roomOwnerId, currentPlayerId, players, initislSortDirection, revealVotes, removePlayer, playerRemovalPermissions = 'host-only' }) => {
  const [sortDirection, setSortDirection] = useState<SortDirection>(initislSortDirection as SortDirection);
  const [sortedPlayers, setSortePlayers] = useState<Player[]>(players);

  const cycleSort = () => {
    const nextDirection: SortDirection =
      sortDirection === 'none' ? 'asc' : sortDirection === 'asc' ? 'desc' : 'none';

    let sorted: Player[] = [...players];

    sorted = applySort(sorted, nextDirection);

    setSortDirection(nextDirection);
    setSortePlayers(sorted);
  };

  const applySort = (dataToSort: Player[], direction: SortDirection) => {
    const sorted = [...dataToSort];
    if (direction === "asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (direction === "desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
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
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading || !players || players.length === 0) {
    const length = 3;
    return (
      <table className="table w-full max-w-4xl mx-auto overflow-x-auto rounded-lg">
        <thead>
          <tr>
            {Array.from({ length: length }).map((_, index) => (
              <th key={index}>
                <div className="skeleton h-5 w-24"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: length }).map((_, index) => (
            <tr key={index}>
              {Array.from({ length: length }).map((_, cellIndex) => (
                <td key={cellIndex}>
                  <div className="skeleton h-5 w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

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
          {sortedPlayers.map((player) => (
            <tr key={player.id} className="hover">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {roomOwnerId === player.id && (
                    <StarIcon className="h-5 w-5 text-yellow-500" title="Room Host" />
                  )}
                  <span>{player.name}</span>
                </div>
              </td>
                <td className="p-3">
                  {player.selection === null || player.selection === undefined ? (
                  <span><MinusIcon className="h-4 w-4" /></span>
                  ) : revealVotes ? (
                  <span className="font-bold">{player.selection}</span>
                  ) : (
                  <span><LockClosedIcon className="h-5 w-5" /></span>
                  )}
                </td>
              <td className="p-1">
                {(() => {
                  // Never allow removing the host or yourself
                  if (player.id === roomOwnerId || player.id === currentPlayerId) {
                    return null;
                  }
                  
                  // Check permissions for who can remove players
                  const canRemovePlayer = playerRemovalPermissions === 'host-only' 
                    ? currentPlayerId === roomOwnerId  // Only host can remove
                    : true; // All players can remove others
                    
                  return canRemovePlayer ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => removePlayer(player.id)}
                      title={playerRemovalPermissions === 'host-only' ? 'Remove player (Host only)' : 'Remove player'}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  ) : null;
                })()}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable