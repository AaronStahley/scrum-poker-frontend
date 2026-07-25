'use client';

import { CardSequenceType } from "@/types/room";
import { CARD_SEQUENCES } from "@/lib/cardSequences";

interface CardSequenceRadioGroupProps {
  value: CardSequenceType;
  onChange: (id: CardSequenceType) => void;
  name: string;
  disabled?: boolean;
}

const CardSequenceRadioGroup: React.FC<CardSequenceRadioGroupProps> = ({ value, onChange, name, disabled }) => {
  return (
    <div className="space-y-3">
      {Object.values(CARD_SEQUENCES).map((config) => (
        <label className="cursor-pointer" key={config.id}>
          <div className="flex items-start justify-between p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
            <div className="flex flex-col items-start">
              <span className="font-bold">{config.label}</span>
              <span className="text-sm text-base-content/70">{config.description}</span>
            </div>
            <input
              type="radio"
              name={name}
              className="radio radio-primary mt-1"
              checked={value === config.id}
              onChange={() => onChange(config.id)}
              disabled={disabled}
            />
          </div>
        </label>
      ))}
    </div>
  );
};

export default CardSequenceRadioGroup;
