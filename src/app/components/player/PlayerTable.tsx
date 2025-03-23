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
  // editPlayer: (playerName: string) => void; //TODO: Implement edit player
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

  return (
    <div className="w-full max-w-4xl mx-auto overflow-x-auto rounded-lg">
      <table className="table w-full border border-base-300">
        <thead>
          <tr className="bg-primary text-primary-content">
            <th className="text-left p-0">
              <button onClick={cycleSort} className="flex items-center justify-between w-full h-full p-3">
              <span>Player</span>
              <span>{getSortIcon()}</span>
              </button>
            </th>
            <th className="text-left">Selection</th>
            <th className="text-left">Has Voted?</th>
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
                {revealVotes ? (
                  <span className="font-bold">{player.selection ?? "?"}</span>
                ) : (
                  <span className="text-secondary">🔒 Hidden</span>
                )}
              </td>
              <td>
                {player.selection !== null && player.selection !== undefined ? (
                  <span className="text-green-500">✅</span>
                ) : (
                  <span className="text-red-500">❌</span>
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
                {/* {player.id === currentPlayerId && (
                  <button
                  className="btn btn-sm btn-danger text-white"
                  onClick={() => removePlayer(player.name)}
                  >
                  <PencilIcon className="h-5 w-5" />
                  </button>
                )} */}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable