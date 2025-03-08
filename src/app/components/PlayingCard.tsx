import React from 'react'

interface PlayingCardProps {
    value: number | string;
    onSelect: (value: number | string) => void;
    isSelected: boolean;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ value, onSelect, isSelected }) => {
  return (
    <button
      className={`card bg-base-100 shadow-lg p-4 rounded-lg transition-all 
        ${isSelected ? "border-4 border-primary scale-105" : "hover:scale-105"}
      `}
      onClick={() => onSelect(value)}
    >
      <div className="card-body flex justify-center items-center">
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </button>
  );
}

export default PlayingCard