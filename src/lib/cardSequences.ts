import { CardSequenceType } from '@/types/room';

export interface CardSequenceItem {
  value: number | string;
  label: string;
}

export interface CardSequenceConfig {
  id: CardSequenceType;
  label: string;
  description: string;
  isNumeric: boolean;
  items: CardSequenceItem[];
}

export const DEFAULT_CARD_SEQUENCE: CardSequenceType = 'fibonacci';

const item = (value: number | string, label?: string): CardSequenceItem => ({
  value,
  label: label ?? String(value),
});

export const CARD_SEQUENCES: Record<CardSequenceType, CardSequenceConfig> = {
  fibonacci: {
    id: 'fibonacci',
    label: 'Fibonacci',
    description: '0, 1, 2, 3, 5, 8, 13, 21, ?',
    isNumeric: true,
    items: [
      item(0), item(1), item(2), item(3), item(5), item(8), item(13), item(21), item('?'),
    ],
  },
  'modified-fibonacci': {
    id: 'modified-fibonacci',
    label: 'Modified Fibonacci',
    description: '0, ½, 1, 2, 3, 5, 8, 13, 20, ?',
    isNumeric: true,
    items: [
      item(0), item(0.5, '½'), item(1), item(2), item(3), item(5), item(8), item(13),
      item(20), item('?'),
    ],
  },
  't-shirt': {
    id: 't-shirt',
    label: 'T-Shirt Sizes',
    description: 'XS, S, M, L, XL, XXL, ? — no numeric estimate',
    isNumeric: false,
    items: [
      item('XS'), item('S'), item('M'), item('L'), item('XL'), item('XXL'), item('?'),
    ],
  },
};

export function getCardSequenceConfig(type?: CardSequenceType | null): CardSequenceConfig {
  return CARD_SEQUENCES[type ?? DEFAULT_CARD_SEQUENCE] ?? CARD_SEQUENCES[DEFAULT_CARD_SEQUENCE];
}

export function getOrderedValues(config: CardSequenceConfig): (number | string)[] {
  return config.items.filter((i) => i.value !== '?').map((i) => i.value);
}

export function getNumericValues(config: CardSequenceConfig): number[] {
  return getOrderedValues(config).filter((v): v is number => typeof v === 'number');
}

// Stored selections are raw values (0.5), but cards are labelled (½) — display sites
// must render the label so a revealed vote matches the card that was clicked.
export function formatCardValue(
  type: CardSequenceType | null | undefined,
  value: number | string
): string {
  const config = getCardSequenceConfig(type);
  return config.items.find((i) => i.value === value)?.label ?? String(value);
}
