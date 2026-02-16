export const PILE_COUNT = 11
export const CARD_Y_GAP = 0.3
export const CARD_TRANSITION_DURATION = 350
export const SUIT_COLORS: string[] = [
  '#e74c3c',
  '#2c3e50',
  '#27ae60',
  '#3d9bcb',
  '#9a54ae',
  '#e28d26',
  '#4761ad',
  '#8a7b63',
]
export const SUIT_NAMES: string[] = [
  'heart',
  'spade',
  'club',
  'diamond',
  'moon',
  'star',
  'water',
  'shield',
]

export const NUM_RANKS = 10
export const NUM_SUITS = 8

const SUITS = Array.from({ length: NUM_SUITS }, (_, i) => i)
const VALUES = Array.from({ length: NUM_RANKS }, (_, i) => i)
export const CARDS = SUITS.map((s) =>
  VALUES.map((n) => ({ rank: n as Rank, suit: s as Suit })),
).flat()
