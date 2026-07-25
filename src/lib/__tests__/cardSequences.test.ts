import { describe, it, expect } from 'vitest';
import { formatCardValue, getCardSequenceConfig, getOrderedValues } from '../cardSequences';

describe('formatCardValue', () => {
  it('renders the card label rather than the stored value', () => {
    expect(formatCardValue('modified-fibonacci', 0.5)).toBe('½');
  });

  it('renders plain values unchanged', () => {
    expect(formatCardValue('fibonacci', 13)).toBe('13');
    expect(formatCardValue('t-shirt', 'XL')).toBe('XL');
  });

  it('falls back to the raw value when it is not in the sequence', () => {
    expect(formatCardValue('t-shirt', 13)).toBe('13');
  });

  it('uses the default sequence when none is given', () => {
    expect(formatCardValue(undefined, 8)).toBe('8');
  });
});

describe('getOrderedValues', () => {
  it('drops the "?" card so it never participates in ranges', () => {
    const values = getOrderedValues(getCardSequenceConfig('t-shirt'));
    expect(values).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  });
});
