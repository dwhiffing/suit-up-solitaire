import { create } from 'zustand'
import { getCardPilePosition } from '.'
import { chunk, shuffle } from 'lodash'
import { CARDS, PILE_COUNT } from './constants'

type MouseParams = { clientX: number; clientY: number }

export interface GameState {
  cards: CardType[]
  activeCard: CardType | null
  cursorState: { mouseX: number; mouseY: number; pressed: boolean }
}

interface GameStore extends GameState {
  newGame: () => void
  onMouseDown: (params: MouseParams) => void
  onMouseUp: (params: MouseParams) => void
  onMouseMove: (params: MouseParams) => void
}

// tracks the initial cursor position when dragging starts
// so that we can tell how far the cursor moved and tell a click from a drag
let cursorDownAt = 0
let cursorDownPos = { x: 0, y: 0 }
// tracks the offset between the cursor and the card position
// so that when you drag, the card anchors to the mouse correctly
let cursorDelta = { x: 0, y: 0 }

export const useGameStore = create<GameStore>((set, get) => ({
  ...initializeGame(),
  newGame: () => set(initializeGame()),
  onMouseDown: ({ clientX, clientY }: MouseParams) => {
    const { activeCard, cards } = get()
    const clickedCard = getCardFromPoint(clientX, clientY, get().cards)

    if (activeCard) {
      set(moveCard(cards, activeCard, clientX, clientY))
    }

    if (
      clickedCard &&
      clickedCard.cardPileIndex === getCardPile(clickedCard, cards).length - 1
    ) {
      set({ activeCard: activeCard ? null : clickedCard })
    }

    if (clickedCard) {
      const { x: cardX, y: cardY } = getCardPilePosition(clickedCard)
      cursorDownPos = { x: clientX, y: clientY }
      cursorDelta = { x: clientX - cardX, y: clientY - cardY }
      cursorDownAt = Date.now()
      set({ cursorState: { mouseX: cardX, mouseY: cardY, pressed: true } })
    }
  },
  onMouseUp: ({ clientX, clientY }: MouseParams) => {
    const { activeCard, cards } = get()
    const posDiff =
      Math.abs(cursorDownPos.x - clientX) + Math.abs(cursorDownPos.y - clientY)
    const timeDiff = Date.now() - cursorDownAt

    if (posDiff > 5 || timeDiff > 300) {
      set(moveCard(cards, activeCard, clientX, clientY))
    }

    cursorDownPos = { x: 0, y: 0 }
    cursorDelta = { x: 0, y: 0 }
    set({ cursorState: { ...get().cursorState, pressed: false } })
  },
  onMouseMove: ({ clientX, clientY }: MouseParams) => {
    const mouseX = clientX - cursorDelta.x
    const mouseY = clientY - cursorDelta.y
    set({ cursorState: { ...get().cursorState, mouseX, mouseY } })
  },
}))

function initializeGame(): GameState {
  const cards = chunk(shuffle(CARDS), Math.ceil(CARDS.length / PILE_COUNT))
    .flatMap((pile, pileIndex) =>
      pile.map((n, i) => ({
        ...n,
        cardPileIndex: i,
        pileIndex:
          pileIndex >= Math.floor(PILE_COUNT / 2) ? pileIndex + 1 : pileIndex,
      })),
    )
    .map((c, i) => ({ ...c, id: i }))

  return {
    cards,
    activeCard: null,
    cursorState: { mouseX: 0, mouseY: 0, pressed: false },
  }
}

const getCardsUnderCard = (cards: CardType[], card: CardType) =>
  getCardPile(card, cards).slice(card.cardPileIndex)

const moveCard = (
  cards: CardType[],
  activeCard: CardType | null,
  x: number,
  y: number,
) => {
  if (!activeCard) return { cards }

  const pileIndex =
    getCardFromPoint(x, y, cards)?.pileIndex ?? getPileFromPoint(x, y)
  const movingCards = getCardsUnderCard(cards, activeCard)

  if (pileIndex === -1) return { cards, activeCard: null }

  const cardsInTargetPile = cards
    .filter((c) => c.pileIndex === pileIndex)
    .sort((a, b) => a.cardPileIndex - b.cardPileIndex)
  const bottomCard = cardsInTargetPile.at(-1)
  const isEmpty = !bottomCard

  const pile = document.querySelector(
    `.pile[data-pileindex="${pileIndex}"]`,
  ) as HTMLDivElement | null
  const pileType = pile?.dataset.piletype || 'tableau'

  const suitsMatch = movingCards.every((c) => c.suit === bottomCard?.suit)
  let isValid =
    !bottomCard ||
    (isAdjacentInValue([bottomCard, ...movingCards]) && suitsMatch)

  if (pileType === 'foundation') {
    if (isEmpty)
      // if foundation and its empty, only allow 0s and 9s
      isValid = movingCards[0].rank === 0 || movingCards[0].rank === 9
  } else if (pileType === 'cheat') {
    // if cheat pile, only allow card if pile is empty
    isValid = isEmpty
  }

  if (!isValid) return { cards, activeCard: null }

  return {
    activeCard: null,
    cards: cards.map((card) => {
      let cardPileIndex = movingCards.findIndex((c) => c.id === card.id)
      if (cardPileIndex === -1) return card

      if (bottomCard) cardPileIndex += bottomCard.cardPileIndex + 1

      return { ...card, pileIndex, cardPileIndex }
    }),
  }
}

const getCardFromPoint = (x: number, y: number, cards: CardType[]) => {
  const elementUnder = document.elementFromPoint(x, y) as HTMLDivElement

  if (elementUnder?.dataset.id) {
    return cards[+elementUnder.dataset.id]
  }

  return undefined
}

const getPileFromPoint = (x: number, y: number) => {
  const elementUnder = document.elementFromPoint(x, y) as HTMLDivElement

  return +(elementUnder?.dataset.pileindex || '-1')
}

const isAdjacentInValue = (cards: CardType[]) =>
  isDescending(cards) || isAscending(cards)

const isDescending = (cards: CardType[]) =>
  cards.filter((card, i) =>
    cards[i + 1] ? card.rank === cards[i + 1].rank + 1 : true,
  ).length === cards.length

const isAscending = (cards: CardType[]) =>
  cards.filter((card, i) =>
    cards[i + 1] ? card.rank === cards[i + 1].rank - 1 : true,
  ).length === cards.length

const getCardPile = (card: CardType, cards: CardType[]) => {
  const pile = cards.filter((c) => c.pileIndex === card.pileIndex)
  return pile.sort((a, b) => a.cardPileIndex - b.cardPileIndex)
}
