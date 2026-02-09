import shuffle from 'lodash/shuffle'
import chunk from 'lodash/chunk'
import clamp from 'lodash/clamp'
import { useEffect, useState } from 'react'

const VALUES = '987654321'
const PILE_COUNT = 6

const CARDS = VALUES.split('')
  .map((n) => [
    { rank: Number(n) as Rank, suit: 0 as Suit },
    { rank: Number(n) as Rank, suit: 1 as Suit },
    { rank: Number(n) as Rank, suit: 2 as Suit },
    { rank: Number(n) as Rank, suit: 3 as Suit },
  ])
  .flat()

export const shuffleDeck = () =>
  chunk(shuffle(CARDS), PILE_COUNT)
    .map((pile, pileIndex) =>
      pile.map((n, i) => ({
        ...n,
        cardPileIndex: i,
        pileIndex,
      })),
    )
    .flat()
    .map((c, i) => ({ ...c, index: i }))

export const moveCard = (
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

  const validOrder =
    destinationCard.rank === -1 ||
    isDescending([destinationCard.rank, ...movingCards.map((m) => m.rank)])

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

export function getCardIsActive(activeCard: CardType | null, card: CardType) {
  let isActive = false

  if (activeCard) {
    isActive =
      activeCard.pileIndex === card.pileIndex &&
      activeCard.cardPileIndex <= card.cardPileIndex
  }

  return isActive
}

export const getBottomCard = (
  card: CardType | undefined,
  cards: CardType[],
) => {
  if (!card) {
    return null
  }

  if (card.rank === -1) {
    return card
  }

  const pile = getCardPile(card, cards)
  card = pile[pile.length - 1]
  return card
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useWindowEvent = (event: any, callback: any) => {
  useEffect(() => {
    window.addEventListener(event, callback)
    return () => window.removeEventListener(event, callback)
  }, [event, callback])
}

export const getCardFromPoint = (x: number, y: number, cards: CardType[]) => {
  const elementUnder = document.elementFromPoint(x, y) as HTMLDivElement

  if (elementUnder?.dataset.index) {
    return cards[+elementUnder.dataset.index]
  }

  return undefined
}

export const useForceUpdate = () => {
  const [, setValue] = useState(0)
  return () => setValue((value) => ++value)
}

export const getCardSpacing = () => {
  const outerWidth = clamp(document.documentElement.clientWidth, 740)
  const outerHeight = clamp(document.documentElement.clientHeight, 740)
  const cardWidth = 50
  const cardHeight = 140
  const xBuffer = (outerWidth - cardWidth * PILE_COUNT) / (PILE_COUNT + 1)
  const width = cardWidth + xBuffer
  const heightBase = outerHeight / 15
  const maxHeight = outerWidth > 450 ? 30 : 20

  const height = clamp(heightBase, maxHeight)
  const yBuffer = clamp(
    (outerHeight - (height * 6.5 + cardHeight)) / 2,
    40,
    1000,
  )

  return { width, height, yBuffer, xBuffer }
}

export const getCardPosition = (card: CardType) => {
  const { width, height, yBuffer, xBuffer } = getCardSpacing()

  const leftoverSpace =
    (document.documentElement.clientWidth - (width * PILE_COUNT - xBuffer)) / 2

  const x = card.pileIndex * width + leftoverSpace
  const y = card.rank === -1 ? yBuffer : yBuffer + card.cardPileIndex * height

  return { x, y }
}

const isDescending = (numbers: number[]) => {
  return (
    numbers.filter((number, index) => {
      return numbers[index + 1] ? number === numbers[index + 1] + 1 : true
    }).length === numbers.length
  )
}

const getCardPile = (card: CardType, cards: CardType[]) => {
  const pile = cards.filter((c) => c.pileIndex === card.pileIndex)
  return pile.sort((a, b) => a.cardPileIndex - b.cardPileIndex)
}
