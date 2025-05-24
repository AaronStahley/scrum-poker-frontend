'use client';
import React, { useState, useEffect } from 'react';
import PlayingCard from "./PlayingCard";

const storyPoints = [0, 1, 2, 3, 5, 8, 13, 21, "?"];

interface PlayingCardSelectorProps {
  playerId?: string;
  onSelect: (id: string, selection: number | string) => void;
  reset: boolean;
}

const PlayingCardSelector: React.FC<PlayingCardSelectorProps> = ({ playerId, onSelect, reset }) => {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);

  const handleSelect = (value: number | string) => {
    if (playerId) {
      setSelectedValue(value);
      onSelect(playerId, value);
    }
  };

  useEffect(() => {
    if (reset) {
      console.log("resetting card selector");
      setSelectedValue(null);
    }
  }, [reset]);

  return (
    <div className="flex flex-wrap gap-4 justify-center p-6 sm:p-4">
      {storyPoints.map((point) => (
        <PlayingCard
          key={point}
          value={point}
          onSelect={() => handleSelect(point)}
          isSelected={selectedValue === point}
        />
      ))}
    </div>
  );
};

export default PlayingCardSelector;