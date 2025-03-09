import React from 'react'

interface Player {
  name: string;
  selection: number | string | null;
}

interface PlayerTableProps {
  players: Player[];
  revealVotes: boolean;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, revealVotes }) => {
  return (
    <div className="w-full max-w-4xl mx-auto overflow-x-auto rounded-lg">
      <table className="table table-zebra w-full border border-base-300">
        <thead>
          <tr className="bg-primary text-white">
            <th className="text-left p-3">Player</th>
            <th className="text-left p-3">Selection</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.name} className="hover">
              <td className="p-3">{player.name}</td>
              <td className="p-3">
                {revealVotes ? (
                  <span className="font-bold">{player.selection ?? "❓"}</span>
                ) : (
                  <span className="text-gray-500">🔒 Hidden</span>
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