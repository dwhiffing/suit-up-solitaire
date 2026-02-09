export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    A: 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
  }
  return values[rank]
}

export function canStackOnTableau(
  movingCard: CardType,
  targetCard: CardType | null,
): boolean {
  // Empty tableau: only King can be placed
  if (!targetCard) {
    return movingCard.rank === 'K'
  }

  // Must be descending rank (one less than target)
  const movingValue = getRankValue(movingCard.rank)
  const targetValue = getRankValue(targetCard.rank)

  return movingValue === targetValue - 1
}

export function canPlaceOnFoundation(
  card: CardType,
  foundationPile: CardType[],
): boolean {
  // Empty foundation: only Ace
  if (foundationPile.length === 0) {
    return card.rank === 'A'
  }

  const topCard = foundationPile[foundationPile.length - 1]

  // Must be same suit and ascending rank
  if (card.suit !== topCard.suit) {
    return false
  }

  const cardValue = getRankValue(card.rank)
  const topValue = getRankValue(topCard.rank)

  return cardValue === topValue + 1
}

export function validateMoveToTableau(
  cards: CardType[],
  tableauPile: CardType[],
): boolean {
  if (cards.length === 0) return false

  const movingCard = cards[0]
  const targetCard =
    tableauPile.length > 0 ? tableauPile[tableauPile.length - 1] : null

  return canStackOnTableau(movingCard, targetCard)
}

export function validateMoveToFoundation(
  cards: CardType[],
  foundationPile: CardType[],
): boolean {
  // Only single cards can move to foundation
  if (cards.length !== 1) return false

  return canPlaceOnFoundation(cards[0], foundationPile)
}

const SUITS: Suit[] = ['red', 'black', 'green', 'blue']
const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
]

export function generateDeck(): CardType[] {
  const deck: CardType[] = []
  let id = 0

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}-${id++}`,
        suit,
        rank,
        faceUp: false,
      })
    }
  }

  return deck
}

export function shuffleDeck(deck: CardType[]): CardType[] {
  // Fisher-Yates shuffle
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
