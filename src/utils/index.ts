import { useEffect, useState } from 'react'
import { CARD_Y_GAP, NUM_RANKS } from './constants'

export const useForceUpdate = () => {
  const [, setValue] = useState(0)
  return () => setValue((value) => ++value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useWindowEvent = (event: any, callback: any) => {
  useEffect(() => {
    window.addEventListener(event, callback)
    return () => window.removeEventListener(event, callback)
  }, [event, callback])
}

export const getCardPilePosition = (card: CardType) => {
  const pileEl = document.querySelector(
    `.pile[data-pileindex="${card.pileIndex}"]`,
  ) as HTMLDivElement | null
  const pilePos = pileEl?.getBoundingClientRect()
  const width = pileEl?.offsetWidth ?? 0
  const height = pileEl?.offsetHeight ?? 0

  let offsetY = 0
  const pileType = pileEl?.dataset.piletype ?? 'tableau'

  if (pileType === 'tableau') {
    offsetY = card.cardPileIndex * (CARD_Y_GAP * width)
  }

  return {
    x: pilePos?.x ?? 0,
    y: (pilePos?.y ?? 0) + offsetY,
    pileType,
    width,
    height,
  }
}

const ROW_STAGGER = 400
const CARD_STAGGER = 30
export const getWinAnimationDelay = (suit: number, rank: number) => {
  const index = suit * NUM_RANKS + rank
  const rowIndex = Math.floor(index / NUM_RANKS)
  const colIndex = index % NUM_RANKS
  return rowIndex * ROW_STAGGER + colIndex * CARD_STAGGER
}

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
