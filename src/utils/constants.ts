export const PILE_COUNT = 11
export const CARD_Y_GAP = 0.25
export const CARD_TRANSITION_DURATION = 200
export const SVG_CARD_WIDTH = 100
export const SVG_CARD_HEIGHT = 100
export const SUIT_COLORS: string[] = [
  '#e74c3c',
  '#2c3e50',
  '#27ae60',
  '#3498db',
  '#a24ca7',
  '#a2a23c',
]

const VALUES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
export const CARDS = VALUES.map((n) => [
  { rank: Number(n) as Rank, suit: 0 as Suit },
  { rank: Number(n) as Rank, suit: 1 as Suit },
  { rank: Number(n) as Rank, suit: 2 as Suit },
  { rank: Number(n) as Rank, suit: 3 as Suit },
  { rank: Number(n) as Rank, suit: 4 as Suit },
  { rank: Number(n) as Rank, suit: 5 as Suit },
]).flat()
