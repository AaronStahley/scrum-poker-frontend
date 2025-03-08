'use client';
import React, { useState } from "react";
import PlayingCard from "./PlayingCard";

const storyPoints = [0, 1, 2, 3, 5, 8, 13, 21, "?"];

const PlayingCardSelector: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);

  return (
    <div className="flex flex-wrap gap-4 justify-center p-6">
        {storyPoints.map((point) => (
            <PlayingCard
            key={point}
            value={point}
            onSelect={setSelectedValue}
            isSelected={selectedValue === point}
            />
        ))}
    </div>
  );
};

export default PlayingCardSelector;