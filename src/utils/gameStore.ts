import { create } from 'zustand'
import {
  generateDeck,
  shuffleDeck,
  validateMoveToFoundation,
  validateMoveToTableau,
} from './cardUtils'

function initializeGame(): GameState {
  const deck = shuffleDeck(generateDeck())
  const tableau: GameState['tableau'] = [[], [], [], [], [], [], []]

  let cardIndex = 0

  // Deal cards to tableau (1, 2, 3, 4, 5, 6, 7 cards per pile)
  for (let pile = 0; pile < 7; pile++) {
    for (let card = 0; card <= pile; card++) {
      const currentCard = deck[cardIndex++]
      // Only the top card is face-up
      currentCard.faceUp = card === pile
      tableau[pile].push(currentCard)
    }
  }

  // Remaining cards go to stock (all face-down)
  const stock = deck.slice(cardIndex)

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    selectedCards: null,
    isWon: false,
  }
}

interface GameStore {
  // State
  stock: CardType[]
  waste: CardType[]
  foundations: CardType[][]
  tableau: CardType[][]
  selectedCards: {
    cards: CardType[]
    sourceType: PileType
    sourceIndex?: number
  } | null
  isWon: boolean

  // Actions
  newGame: () => void
  drawCard: () => void
  selectCards: (
    cards: CardType[],
    sourceType: PileType,
    sourceIndex?: number,
  ) => void
  deselectCards: () => void
  moveToFoundation: (foundationIndex: number) => void
  moveToTableau: (tableauIndex: number) => void
  checkWinCondition: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  ...initializeGame(),

  // Initialize new game
  newGame: () => {
    set(initializeGame())
  },

  // Draw card from stock to waste
  drawCard: () => {
    const { stock, waste } = get()

    if (stock.length === 0) {
      // Refresh stock from waste (reverse order)
      const newStock = [...waste].reverse().map((card) => ({
        ...card,
        faceUp: false,
      }))
      set({ stock: newStock, waste: [], selectedCards: null })
    } else {
      const newStock = [...stock]
      const drawnCard = newStock.pop()!
      drawnCard.faceUp = true

      set({
        stock: newStock,
        waste: [...waste, drawnCard],
        selectedCards: null,
      })
    }
  },

  // Select cards
  selectCards: (cards, sourceType, sourceIndex) => {
    set({
      selectedCards: {
        cards,
        sourceType,
        sourceIndex,
      },
    })
  },

  // Deselect cards
  deselectCards: () => {
    set({ selectedCards: null })
  },

  // Move selected cards to foundation
  moveToFoundation: (foundationIndex) => {
    const { selectedCards, waste, tableau, foundations } = get()

    if (!selectedCards) return

    const { cards, sourceType, sourceIndex } = selectedCards

    // Validate move
    if (!validateMoveToFoundation(cards, foundations[foundationIndex])) {
      set({ selectedCards: null })
      return
    }

    const newFoundations = foundations.map((pile, idx) =>
      idx === foundationIndex ? [...pile, cards[0]] : pile,
    )

    let newWaste = waste
    let newTableau = tableau

    // Remove from source
    if (sourceType === 'waste') {
      newWaste = waste.slice(0, -1)
    } else if (sourceType === 'tableau' && sourceIndex !== undefined) {
      newTableau = tableau.map((pile, idx) => {
        if (idx !== sourceIndex) return pile

        const newPile = pile.slice(0, -cards.length)

        // Flip top card if exists
        if (newPile.length > 0 && !newPile[newPile.length - 1].faceUp) {
          newPile[newPile.length - 1] = {
            ...newPile[newPile.length - 1],
            faceUp: true,
          }
        }

        return newPile
      })
    }

    set({
      foundations: newFoundations,
      waste: newWaste,
      tableau: newTableau,
      selectedCards: null,
    })

    get().checkWinCondition()
  },

  // Move selected cards to tableau
  moveToTableau: (tableauIndex) => {
    const { selectedCards, waste, tableau, foundations } = get()

    if (!selectedCards) return

    const { cards, sourceType, sourceIndex } = selectedCards

    // Validate move
    if (!validateMoveToTableau(cards, tableau[tableauIndex])) {
      set({ selectedCards: null })
      return
    }

    let newTableau = tableau.map((pile, idx) =>
      idx === tableauIndex ? [...pile, ...cards] : pile,
    )

    let newWaste = waste
    let newFoundations = foundations

    // Remove from source
    if (sourceType === 'waste') {
      newWaste = waste.slice(0, -1)
    } else if (sourceType === 'foundation' && sourceIndex !== undefined) {
      newFoundations = foundations.map((pile, idx) =>
        idx === sourceIndex ? pile.slice(0, -1) : pile,
      )
    } else if (sourceType === 'tableau' && sourceIndex !== undefined) {
      newTableau = newTableau.map((pile, idx) => {
        if (idx !== sourceIndex) return pile

        const newPile = pile.slice(0, -cards.length)

        // Flip top card if exists
        if (newPile.length > 0 && !newPile[newPile.length - 1].faceUp) {
          newPile[newPile.length - 1] = {
            ...newPile[newPile.length - 1],
            faceUp: true,
          }
        }

        return newPile
      })
    }

    set({
      tableau: newTableau,
      waste: newWaste,
      foundations: newFoundations,
      selectedCards: null,
    })
  },

  // Check if game is won
  checkWinCondition: () => {
    const { foundations } = get()
    const isWon = foundations.every((pile) => pile.length === 13)

    if (isWon) {
      set({ isWon: true })
    }
  },
}))
