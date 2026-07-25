'use client';
import React, { useState, useEffect } from 'react';
import PlayingCard from "./PlayingCard";
import { CardSequenceType } from "@/types/room";
import { getCardSequenceConfig } from "@/lib/cardSequences";

interface PlayingCardSelectorProps {
  playerId?: string;
  onSelect: (id: string, selection: number | string) => void;
  reset: boolean;
  cardSequence?: CardSequenceType;
}

const PlayingCardSelector: React.FC<PlayingCardSelectorProps> = ({ playerId, onSelect, reset, cardSequence }) => {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);
  const { items } = getCardSequenceConfig(cardSequence);

  const handleSelect = (value: number | string) => {
    if (!playerId) {
      console.error('PlayingCardSelector: No playerId provided');
      return;
    }
    
    // Optimistic update - immediately show the selection
    setSelectedValue(value);
    
    // Call the debounced callback
    onSelect(playerId, value);
  };

  useEffect(() => {
    if (reset) {
      console.log("resetting card selector");
      setSelectedValue(null);
    }
  }, [reset]);

  // A sequence change clears every selection server-side, so drop the local
  // highlight too — otherwise it would point at a card that no longer exists.
  useEffect(() => {
    setSelectedValue(null);
  }, [cardSequence]);

  return (
    <div className="flex flex-wrap gap-4 justify-center p-6 sm:p-4">
      {items.map(({ value, label }) => (
        <PlayingCard
          key={String(value)}
          value={label}
          onSelect={() => handleSelect(value)}
          isSelected={selectedValue === value}
        />
      ))}
    </div>
  );
};

export default PlayingCardSelector;