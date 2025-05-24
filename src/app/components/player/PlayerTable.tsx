import { useState, useEffect } from 'react';
import { Player } from '../../../types/player';
import { TrashIcon, ArrowLongUpIcon, ArrowLongDownIcon, ArrowsUpDownIcon } from '@heroicons/react/20/solid';

interface PlayerTableProps {
  initislSortDirection: string;
  roomOwnerId: string | undefined;
  currentPlayerId: string | null;
  players: Player[];
  revealVotes: boolean;
  removePlayer: (playerName: string) => void;
}

type SortDirection = 'asc' | 'desc' | 'none';

const PlayerTable: React.FC<PlayerTableProps> = ({ roomOwnerId, currentPlayerId, players, initislSortDirection, revealVotes, removePlayer }) => {
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
                {/* <div aria-label="status" className="status status-success mr-3"></div> */}
                {player.name}
              </td>
                <td className="p-3">
                  {player.selection === null || player.selection === undefined ? (
                  <span className="text-primary-content">-</span>
                  ) : revealVotes ? (
                  <span className="font-bold">{player.selection}</span>
                  ) : (
                  <span className="text-secondary">🔒</span>
                  )}
                </td>
              <td className="p-1">
                {roomOwnerId != player.id && player.id !== currentPlayerId && (
                  <button
                  className="btn btn-danger"
                  onClick={() => removePlayer(player.id)}
                  >
                  <TrashIcon className="h-5 w-5" />
                  </button>
                )}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable