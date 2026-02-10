import { useEffect, useState } from 'react'
import { CARD_HEIGHT, CARD_Y_GAP } from './constants'

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

export const getCardPosition = (card: CardType) => {
  const pileEl = document.querySelector(
    `.pile[data-pileindex="${card.pileIndex}"]`,
  )
  const rect = pileEl?.getBoundingClientRect() ?? { x: 0, y: 0 }
  const { x: pileX, y: pileY } = rect

  return {
    x: pileX,
    y: pileY + card.cardPileIndex * (CARD_Y_GAP * CARD_HEIGHT),
  }
}
