export const PILE_COUNT = 11
export const CARD_Y_GAP = 0.25
export const CARD_TRANSITION_DURATION = 350
export const SUIT_COLORS: string[] = [
  '#e74c3c',
  '#2c3e50',
  '#27ae60',
  '#3d9bcb',
  '#9a54ae',
  '#e09049',
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

const SUITS = [0, 1, 2, 3, 4, 5, 6, 7]
const VALUES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
export const CARDS = SUITS.map((s) =>
  VALUES.map((n) => ({ rank: n as Rank, suit: s as Suit })),
).flat()
