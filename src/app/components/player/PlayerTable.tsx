import React from 'react'
import { Player } from '../../../types/player';
import { TrashIcon } from '@heroicons/react/20/solid';

interface PlayerTableProps {
  currentPlayerId: string | null;
  players: Player[];
  revealVotes: boolean;
  removePlayer: (playerName: string) => void;
  // editPlayer: (playerName: string) => void; //TODO: Implement edit player
}

const PlayerTable: React.FC<PlayerTableProps> = ({ currentPlayerId, players, revealVotes, removePlayer }) => {
  return (
    <div className="w-full max-w-4xl mx-auto overflow-x-auto rounded-lg">
      <table className="table table-zebra w-full border border-base-300">
        <thead>
          <tr className="bg-primary text-white">
            <th className="text-left p-3">Player</th>
            <th className="text-left p-3">Selection</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.name} className="hover">
              <td className="p-3">{player.name}</td>
              <td className="p-3">
                {revealVotes ? (
                  <span className="font-bold">{player.selection ?? "?"}</span>
                ) : (
                  <span className="text-secondary">🔒 Hidden</span>
                )}
              </td>
              <td className="p-1">
                {player.id !== currentPlayerId && (
                  <button
                  className="btn btn-sm btn-danger text-white"
                  onClick={() => removePlayer(player.name)}
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