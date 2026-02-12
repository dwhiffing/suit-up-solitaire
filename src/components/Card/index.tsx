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
  const [isActive, setIsActive] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  useWindowEvent('resize', debounce(useForceUpdate(), 500))
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHasMounted(true), [])

  // delay changes to zIndex until after transition completes
  useEffect(() => {
    const timeout = setTimeout(
      () => setIsActive(store.isActive),
      !isActive && store.isActive ? 0 : CARD_TRANSITION_DURATION,
    )
    return () => clearTimeout(timeout)
  }, [isActive, store.isActive])

  const isFaceUp = true

  const style = {
    zIndex: store.zIndex + (isActive ? 1000 : 0),
    scale: store.scale,
    transitionProperty:
      !hasMounted || store.isActive ? 'scale' : 'scale, translate',
    pointerEvents: (store.isActive ? 'none' : 'auto') as 'none' | 'auto',
    translate: `${store.x}px ${store.y}px`,
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
  const { mouseX, mouseY, pressed } = state.cursorState
  const { x: xPos, y: yPos, pileType, width } = getCardPilePosition(card)

  const activeIndex = state.activeCard?.cardPileIndex ?? 0
  const cardIndex = card.cardPileIndex

  const isActive = cardId === state.activeCard?.id

  const yDiff = Math.abs(activeIndex - cardIndex) * (CARD_Y_GAP * width)

  const x = isActive && pressed ? mouseX : xPos
  const y = isActive && pressed ? mouseY + yDiff : yPos
  const zIndex = cardIndex
  const scale = isActive ? 1.15 : 1

  return { card, x, y, zIndex, scale, isActive, pileType }
}

export default memo(Card)
