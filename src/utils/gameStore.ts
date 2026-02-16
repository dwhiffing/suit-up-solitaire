import { create } from 'zustand'
import { getCardPilePosition, getWinAnimationDelay } from '.'
import { chunk, shuffle } from 'lodash'
import {
  CARDS,
  CARD_TRANSITION_DURATION,
  NUM_RANKS,
  PILE_COUNT,
} from './constants'

let intervalId: number | null = null

type MouseParams = { clientX: number; clientY: number }

export interface GameState {
  cards: CardType[]
  activeCard: CardType | null
  cursorState: { mouseX: number; mouseY: number; pressed: boolean }
  shuffleIndex: number
  suitCount: number
  winStartTime: number | null
  winAnimProgress: number
}

interface GameStore extends GameState {
  newGame: (suitCount: number) => void
  setSuitCount: (count: number) => void
  onMouseDown: (params: MouseParams) => void
  onMouseUp: (params: MouseParams) => void
  onMouseMove: (params: MouseParams) => void
  startWinAnimation: () => void
  autoCompleteGame: () => void
}

// tracks the initial cursor position when dragging starts
// so that we can tell how far the cursor moved and tell a click from a drag
let cursorDownAt = 0
let cursorDownPos = { x: 0, y: 0 }
// tracks the offset between the cursor and the card position
// so that when you drag, the card anchors to the mouse correctly
let cursorDelta = { x: 0, y: 0 }
let shuffleTimeout: number | null = null
let lastDoubleClickAt = 0

const animateShuffle = (
  set: (state: Partial<GameStore>) => void,
  get: () => GameStore,
) => {
  if (shuffleTimeout) clearTimeout(shuffleTimeout)

  const increment = () => {
    const { shuffleIndex, cards } = get()
    if (shuffleIndex < cards.length) {
      set({ shuffleIndex: shuffleIndex + 1 })
      shuffleTimeout = setTimeout(increment, 10)
    }
  }

  increment()
}

export const useGameStore = create<GameStore>((set, get) => {
  const newGame = (suitCount: number) => {
    set(initializeGame(suitCount))
    setTimeout(() => animateShuffle(set, get), 500)
  }
  const suitCount = Number(localStorage.getItem('suitCount') ?? '4')
  newGame(suitCount)
  return {
    ...initializeGame(suitCount),
    newGame,
    setSuitCount: (suitCount: number) => {
      localStorage.setItem('suitCount', suitCount.toString())
      set({ suitCount })
      newGame(suitCount)
    },
    startWinAnimation: () => {
      const { winStartTime, suitCount } = get()
      if (winStartTime !== null) return
      if (intervalId !== null) clearInterval(intervalId)

      set({ winStartTime: Date.now() })

      const delay = getWinAnimationDelay(suitCount - 1, 9)
      setTimeout(() => {
        const animate = () => {
          const p = get().winAnimProgress
          set({ winAnimProgress: (p + CARD_TRANSITION_DURATION * 0.00005) % 1 })
        }
        intervalId = setInterval(animate, CARD_TRANSITION_DURATION)
      }, delay)
    },
    autoCompleteGame: () => {
      set({
        cards: get().cards.map((card) => ({
          ...card,
          pileIndex:
            card.suit === 0 && card.rank === 9 ? 0 : PILE_COUNT + card.suit,
          cardPileIndex: card.suit === 0 && card.rank === 9 ? 0 : card.rank,
        })),
      })
    },
    onMouseDown: ({ clientX, clientY }: MouseParams) => {
      const { activeCard, cards } = get()
      const clickedCard = getCardFromPoint(clientX, clientY, get().cards)

      const isDoubleClick =
        clickedCard?.id === activeCard?.id && Date.now() - cursorDownAt < 500

      if (isDoubleClick && clickedCard) {
        const pileIndex = findValidFoundationPile(
          clickedCard,
          cards,
          get().suitCount,
        )
        if (pileIndex !== null) {
          lastDoubleClickAt = Date.now()
          moveCard(clickedCard, pileIndex, get, set)
          return
        }
      }

      if (activeCard) {
        const targetPileIndex = getPileAtPoint(clientX, clientY, cards)
        moveCard(activeCard, targetPileIndex, get, set)
      }

      if (
        clickedCard &&
        clickedCard?.cardPileIndex ===
          getCardPile(clickedCard.pileIndex, cards).length - 1 &&
        !isPileComplete(clickedCard.pileIndex, cards)
      ) {
        set({ activeCard: activeCard ? null : clickedCard })
      }

      cursorDownPos = { x: clientX, y: clientY }
      cursorDownAt = Date.now()
      if (clickedCard) {
        const { x: cardX, y: cardY } = getCardPilePosition(clickedCard)
        cursorDelta = { x: clientX - cardX, y: clientY - cardY }
        set({ cursorState: { mouseX: cardX, mouseY: cardY, pressed: true } })
      }
    },
    onMouseUp: ({ clientX, clientY }: MouseParams) => {
      const { activeCard, cards } = get()
      const posDiff =
        Math.abs(cursorDownPos.x - clientX) +
        Math.abs(cursorDownPos.y - clientY)
      const timeDiff = Date.now() - cursorDownAt

      if (
        activeCard &&
        (posDiff > 5 || timeDiff > 300) &&
        Date.now() - lastDoubleClickAt > 300
      ) {
        const { width, height } = getCardPilePosition(activeCard)
        const x = clientX + (width / 2 - cursorDelta.x)
        const y = clientY + (height / 2 - cursorDelta.y)
        const targetPileIndex = getPileAtPoint(x, y, cards)
        moveCard(activeCard, targetPileIndex, get, set)
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
  }
})

function initializeGame(suitCount: number): GameState {
  const selectedCards = CARDS.filter((card) => card.suit < suitCount)

  const cards = chunk(
    shuffle(selectedCards),
    Math.ceil(selectedCards.length / PILE_COUNT),
  )
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
    shuffleIndex: -1,
    suitCount,
    winStartTime: null,
    winAnimProgress: 0,
  }
}

const getPileAtPoint = (x: number, y: number, cards: CardType[]) =>
  getCardFromPoint(x, y, cards)?.pileIndex ?? getPileFromPoint(x, y)

const moveCard = (
  activeCard: CardType | null,
  pileIndex: number,
  get: () => GameStore,
  set: (state: Partial<GameStore>) => void,
) => {
  const cards = get().cards
  if (!activeCard || pileIndex === -1) return set({ cards, activeCard: null })

  const cardsInTargetPile = getCardPile(pileIndex, cards)
  const targetCard = cardsInTargetPile.at(-1) ?? null
  const sourcePileIndex = activeCard.pileIndex

  // const movingCards = getCardPile(activeCard.pileIndex, cards).slice(activeCard.cardPileIndex)
  const movingCards = [activeCard]

  const pile = document.querySelector(
    `.pile[data-pileindex="${pileIndex}"]`,
  ) as HTMLDivElement | null
  const pileType = pile?.dataset.piletype || 'tableau'

  const suitsMatch = movingCards.every((c) => c.suit === targetCard?.suit)
  let isValid =
    !targetCard ||
    (isAdjacentInValue([targetCard, ...movingCards]) && suitsMatch)

  if (pileType === 'foundation') {
    if (!targetCard)
      // if foundation and its empty, only allow 0s and 9s
      isValid = movingCards[0].rank === 0 || movingCards[0].rank === 9
  }

  if (!isValid) return set({ cards, activeCard: null })

  set({
    activeCard: null,
    cards: cards.map((card) => {
      let cardPileIndex = movingCards.findIndex((c) => c.id === card.id)
      if (cardPileIndex === -1) return card

      if (targetCard) cardPileIndex += targetCard.cardPileIndex + 1

      return { ...card, pileIndex: pileIndex, cardPileIndex }
    }),
  })

  if (get().cards.every((card) => card.pileIndex >= PILE_COUNT)) {
    setTimeout(() => get().startWinAnimation(), CARD_TRANSITION_DURATION * 1.5)
  }

  checkAndCascade(sourcePileIndex, pileIndex, get, set)
}

const checkAndCascade = (
  sourcePileIndex: number,
  targetPileIndex: number,
  get: () => GameStore,
  set: (state: Partial<GameStore>) => void,
) => {
  const { cards } = get()
  const nextCard = getCardPile(sourcePileIndex, cards).at(-1)
  const lastCard = getCardPile(targetPileIndex, cards).at(-1)

  if (!nextCard || !lastCard) return

  const suitsMatch = nextCard.suit === lastCard.suit
  const ranksAdjacent = Math.abs(nextCard.rank - lastCard.rank) === 1

  if (!suitsMatch || !ranksAdjacent) return

  setTimeout(() => {
    set({ activeCard: nextCard })
    setTimeout(() => {
      moveCard(nextCard, targetPileIndex, get, set)
      checkAndCascade(sourcePileIndex, targetPileIndex, get, set)
    }, CARD_TRANSITION_DURATION * 0.7)
  }, 0)
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

const getCardPile = (pileIndex: number, cards: CardType[]) => {
  const pile = cards.filter((c) => c.pileIndex === pileIndex)
  return pile.sort((a, b) => a.cardPileIndex - b.cardPileIndex)
}

export const isPileComplete = (pileIndex: number, cards: CardType[]): boolean =>
  getCardPile(pileIndex, cards).length === NUM_RANKS &&
  pileIndex > PILE_COUNT - 1

const findValidFoundationPile = (
  card: CardType,
  cards: CardType[],
  suitCount: number,
): number | null => {
  for (let i = 0; i < suitCount; i++) {
    const foundationPileIndex = PILE_COUNT + i
    const foundationCards = getCardPile(foundationPileIndex, cards)
    const topCard = foundationCards.at(-1)

    if (!topCard) continue

    const suitsMatch = card.suit === topCard.suit
    const ranksAdjacent = isAdjacentInValue([topCard, card])

    if (suitsMatch && ranksAdjacent) {
      return foundationPileIndex
    }
  }

  if (card.rank === 0 || card.rank === 9) {
    for (let i = 0; i < suitCount; i++) {
      if (getCardPile(PILE_COUNT + i, cards).length === 0) {
        return PILE_COUNT + i
      }
    }
    return null
  }

  return null
}
