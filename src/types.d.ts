type Suit = 0 | 1 | 2 | 3
type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

interface CardType {
  index: number
  pileIndex: number
  cardPileIndex: number
  suit: Suit
  rank: Rank
}
