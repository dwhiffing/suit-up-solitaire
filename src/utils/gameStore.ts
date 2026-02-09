import { create } from 'zustand'
import { getCardPosition } from '.'
import { chunk, shuffle } from 'lodash'
import { CARDS, PILE_COUNT } from './constants'

type MouseParams = { clientX: number; clientY: number }
interface GameState {
  cards: CardType[]
  activeCard: CardType | null
  cursorState: { mouseX: number; mouseY: number; pressed: boolean }
}
interface GameStore extends GameState {
  newGame: () => void
  moveCard: (clickedCard: CardType) => void
  selectCard: (card: CardType | null) => void
  onMouseDown: (params: MouseParams) => void
  onMouseUp: (params: MouseParams) => void
  onMouseMove: (params: MouseParams) => void
}

let cursorStartRef = { x: 0, y: 0 }
let cursorDeltaRef = { x: 0, y: 0 }

export const useGameStore = create<GameStore>((set, get) => ({
  ...initializeGame(),
  newGame: () => set(initializeGame()),
  moveCard: (clickedCard: CardType) => {
    set({
      cards: moveCard(get().cards, get().activeCard!, clickedCard),
    })
  },
  selectCard: (clickedCard: CardType | null) => {
    set({ activeCard: clickedCard })
  },
  onMouseDown: ({ clientX, clientY }: MouseParams) => {
    const card = getCardFromPoint(clientX, clientY, get().cards)
    if (card) {
      const { activeCard, cards, moveCard, selectCard } = get()

      if (activeCard) {
        const bottomCard = getBottomCard(card, cards)
        if (bottomCard) moveCard(bottomCard)

        selectCard(null)
      } else {
        selectCard(card)
      }
      const { x: mouseX, y: mouseY } = getCardPosition(card)
      cursorStartRef = { x: clientX, y: clientY }
      cursorDeltaRef = { x: clientX - mouseX, y: clientY - mouseY }

      set({ cursorState: { mouseX, mouseY, pressed: true } })
    } else {
      get().selectCard(null)
    }
  },
  onMouseUp: ({ clientX, clientY }: MouseParams) => {
    const diffX = Math.abs(cursorStartRef.x - clientX)
    const diffY = Math.abs(cursorStartRef.y - clientY)
    const passedThreshold = diffX > 15 || diffY > 15

    cursorDeltaRef = { x: 0, y: 0 }
    set({
      cursorState: {
        mouseX: get().cursorState.mouseX,
        mouseY: get().cursorState.mouseY,
        pressed: false,
      },
    })

    if (get().activeCard) {
      let clickedCard = getCardFromPoint(clientX, clientY, get().cards)
      const bottomCard = getBottomCard(clickedCard, get().cards)!
      if (bottomCard) clickedCard = bottomCard
      if (clickedCard) {
        get().moveCard(clickedCard)
      }
      if (passedThreshold) {
        get().selectCard(null)
      }
    }
  },
  onMouseMove: ({ clientX, clientY }: MouseParams) => {
    const mouseY = clientY - cursorDeltaRef.y
    const mouseX = clientX - cursorDeltaRef.x
    set({ cursorState: { mouseX, mouseY, pressed: get().cursorState.pressed } })
  },
}))

function initializeGame(): GameState {
  const cards = chunk(shuffle(CARDS), PILE_COUNT)
    .flatMap((pile, pileIndex) =>
      pile.map((n, i) => ({ ...n, cardPileIndex: i, pileIndex })),
    )
    .map((c, i) => ({ ...c, index: i }))

  return {
    cards,
    activeCard: null,
    cursorState: { mouseX: 0, mouseY: 0, pressed: false },
  }
}

const moveCard = (
  cards: CardType[],
  movedCard: CardType,
  destinationCard: CardType,
) => {
  const sourcePile = getCardPile(movedCard, cards)
  if (!destinationCard) {
    return cards
  }

  const numToMove = sourcePile.length - movedCard.cardPileIndex

  const movingCards = sourcePile.slice(
    movedCard.cardPileIndex,
    movedCard.cardPileIndex + numToMove,
  )

  const validOrder = isDescending([
    destinationCard.rank,
    ...movingCards.map((m) => m.rank),
  ])

  return cards.map((card) => {
    if (
      card.pileIndex !== movedCard.pileIndex ||
      movedCard.pileIndex === destinationCard.pileIndex
    ) {
      return card
    }

    if (!movingCards.map((c) => c.index).includes(card.index)) {
      return card
    }

    if (validOrder && !Number.isNaN(destinationCard.pileIndex)) {
      const cardPileIndex =
        destinationCard.cardPileIndex +
        movingCards.findIndex((c) => c.index === card.index) +
        1

      return {
        ...card,
        pileIndex: destinationCard.pileIndex,
        cardPileIndex,
      }
    }

    return card
  })
}

const getBottomCard = (card: CardType | undefined, cards: CardType[]) =>
  card ? getCardPile(card, cards).at(-1) : null

const getCardFromPoint = (x: number, y: number, cards: CardType[]) => {
  const elementUnder = document.elementFromPoint(x, y) as HTMLDivElement

  if (elementUnder?.dataset.index) {
    return cards[+elementUnder.dataset.index]
  }

  return undefined
}

const isDescending = (numbers: number[]) =>
  numbers.filter((number, index) => {
    return numbers[index + 1] ? number === numbers[index + 1] + 1 : true
  }).length === numbers.length

const getCardPile = (card: CardType, cards: CardType[]) => {
  const pile = cards.filter((c) => c.pileIndex === card.pileIndex)
  return pile.sort((a, b) => a.cardPileIndex - b.cardPileIndex)
}
