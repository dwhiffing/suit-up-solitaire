import { useEffect, useState } from 'react'
import { NUM_RANKS, PILE_COUNT } from './constants'

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

export const getPileSize = () => {
  const pileEl = document.querySelector('.pile') as HTMLDivElement | null
  return {
    width: pileEl?.offsetWidth ?? 0,
    height: pileEl?.offsetHeight ?? 0,
  }
}

const getPilePos = (pileIndex: number) => {
  const pileEl = document.querySelector(
    `.pile[data-pileindex="${pileIndex}"]`,
  ) as HTMLDivElement | null
  const pilePos = pileEl?.getBoundingClientRect()
  return { x: pilePos?.x ?? 0, y: pilePos?.y ?? 0 }
}

export const getCardPilePosition = (card: CardType) => {
  const pilePos = getPilePos(card.pileIndex)
  let offsetY = 0
  const pileType = card.pileIndex < PILE_COUNT ? 'tableau' : 'foundation'

  const CARD_Y_GAP = window.innerHeight < 500 ? 0.25 : 0.3
  if (pileType === 'tableau') {
    const { width } = getPileSize()
    offsetY = card.cardPileIndex * (CARD_Y_GAP * width)
  }

  return {
    x: pilePos.x,
    y: pilePos.y + offsetY,
    pileType,
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

const padTime = (num: number) => num.toString().padStart(2, '0')

export const formatTime = (
  totalSeconds: number,
  displayLabels = false,
): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (displayLabels) {
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  if (hours > 0) return `${hours}:${padTime(minutes)}:${padTime(seconds)}`
  return `${padTime(minutes)}:${padTime(seconds)}`
}

export const loadStorage = (key: string): any => {
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : {}
}

export const saveStorage = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value))

export const cn = (...args: (string | false | null | undefined)[]) =>
  args.filter(Boolean).join(' ')
