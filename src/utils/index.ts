import clamp from 'lodash/clamp'
import { useEffect, useState } from 'react'
import { CARD_X_GAP, CARD_Y_GAP, PILE_COUNT } from './constants'

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
  const cardWidth = convertRemToPixels(3.875)
  // const cardHeight = cardWidth * 1.387

  const outerWidth = document.documentElement.clientWidth
  const outerHeight = clamp(document.documentElement.clientHeight, 740)
  const pileWidth = cardWidth + CARD_X_GAP

  const yBuffer = outerHeight / 2
  const xBuffer = (outerWidth - (pileWidth * PILE_COUNT - CARD_X_GAP)) / 2

  const x = xBuffer + card.pileIndex * pileWidth
  const y = yBuffer + card.cardPileIndex * CARD_Y_GAP

  return { x, y }
}

function convertRemToPixels(rem: number) {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  )

  return rem * rootFontSize
}
