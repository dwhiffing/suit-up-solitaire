import { useEffect, useState, memo } from 'react'
import debounce from 'lodash/debounce'
import { useShallow } from 'zustand/react/shallow'

import { CardBack, CardFront } from './svg'
import {
  getCardPilePosition,
  useWindowEvent,
  useForceUpdate,
} from '../../utils'
import { useGameStore, type GameState } from '../../utils/gameStore'
import { CARD_Y_GAP, CARD_TRANSITION_DURATION } from '../../utils/constants'

const Card = ({ cardId }: { cardId: number }) => {
  const store = useGameStore(useShallow(getShallowCardState(cardId)))
  const [zIndex, setZIndex] = useState(store.card.cardPileIndex)
  const [hasMounted, setHasMounted] = useState(false)
  useWindowEvent('resize', debounce(useForceUpdate(), 500))
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHasMounted(true), [])

  // delay changes to zIndex until after transition completes
  useEffect(() => {
    const duration = store.isDragging ? 0 : CARD_TRANSITION_DURATION
    const timeout = setTimeout(() => setZIndex(store.zIndex), duration)
    return () => clearTimeout(timeout)
  }, [store.isDragging, store.zIndex])

  const isFaceUp = true

  const style = {
    zIndex,
    scale: store.scale,
    transitionProperty: store.isDragging ? 'scale' : 'scale, translate',
    pointerEvents: (store.isDragging ? 'none' : 'auto') as 'none' | 'auto',
    translate: `${store.x}px ${store.y}px`,
    transitionDuration: hasMounted ? `${CARD_TRANSITION_DURATION}ms` : '0ms',
    boxShadow:
      store.pileType === 'tableau' ? '0 0 5px rgba(0, 0, 0, 0.25)' : 'none',
  }

  if (!hasMounted) return null

  return (
    <div data-id={cardId} className="card" style={style}>
      {isFaceUp ? (
        <CardFront suit={store.card.suit} rank={store.card.rank} />
      ) : (
        <CardBack />
      )}
    </div>
  )
}

const getShallowCardState = (cardId: number) => (state: GameState) => {
  const card = state.cards[cardId]
  const { pressed, mouseX, mouseY } = state.cursorState
  const { x: xPos, y: yPos, pileType, width } = getCardPilePosition(card)

  const activeIndex = state.activeCard?.cardPileIndex ?? 0
  const samePile = state.activeCard?.pileIndex === card.pileIndex
  const cardIndex = card.cardPileIndex

  const isActive = samePile && activeIndex <= cardIndex
  const isDragging = pressed && isActive

  const yDiff = Math.abs(activeIndex - cardIndex) * (CARD_Y_GAP * width)

  const x = isDragging ? mouseX : xPos
  const y = isDragging ? mouseY + yDiff : yPos
  const zIndex = cardIndex + (isDragging ? 100 : 0)
  const scale = isActive ? 1.15 : 1

  return { card, x, y, zIndex, scale, isDragging, pileType }
}

export default memo(Card)
