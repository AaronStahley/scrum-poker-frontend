'use client';
import React, { useState } from "react";
import PlayingCard from "./PlayingCard";

const storyPoints = [0, 1, 2, 3, 5, 8, 13, 21, "?"];

const PlayingCardSelector = ({ onSelect }: {onSelect: (id: string, selection: number | string) => void }) => {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);
  const playerId = localStorage.getItem("playerId");
  

  const handleSelect = (value: number | string) => {
    if (playerId) {
      setSelectedValue(value);
      onSelect(playerId, value);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center  p-6 sm:p-4">
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