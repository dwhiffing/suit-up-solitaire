type Suit = 'red' | 'black' | 'green' | 'blue'
type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'

interface CardType {
  id: string
  suit: Suit
  rank: Rank
  faceUp: boolean
}

type PileType = 'waste' | 'foundation' | 'tableau'

interface SelectedCards {
  cards: CardType[]
  sourceType: PileType
  sourceIndex?: number
}

interface GameState {
  stock: CardType[]
  waste: CardType[]
  foundations: CardType[][]
  tableau: CardType[][]
  selectedCards: SelectedCards | null
  isWon: boolean
}
