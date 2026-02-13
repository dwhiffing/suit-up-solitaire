import { useEffect, useState } from 'react'
import { CARD_Y_GAP } from './constants'

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
