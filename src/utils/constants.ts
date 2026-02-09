export const CARD_X_GAP = 20
export const CARD_Y_GAP = 20
export const PILE_COUNT = 6
export const VALUES = '987654321'

export const CARDS = VALUES.split('')
  .map((n) => [
    { rank: Number(n) as Rank, suit: 0 as Suit },
    { rank: Number(n) as Rank, suit: 1 as Suit },
    { rank: Number(n) as Rank, suit: 2 as Suit },
    { rank: Number(n) as Rank, suit: 3 as Suit },
  ])
  .flat()
