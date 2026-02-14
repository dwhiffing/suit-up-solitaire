import { useEffect, useState, memo } from 'react'
import debounce from 'lodash/debounce'
import { useShallow } from 'zustand/react/shallow'

import { CardBackSVG, CardFront } from './svg'
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
  const [zIndex, setZIndex] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  useWindowEvent('resize', debounce(useForceUpdate(), 100))
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHasMounted(true), [])

  // delay changes to zIndex until after transition completes
  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setIsActive(store.isActive)
        setZIndex(store.cardPileIndex)
      },
      !isActive && store.isActive ? 0 : CARD_TRANSITION_DURATION,
    )
    return () => clearTimeout(timeout)
  }, [isActive, store.cardPileIndex, store.isActive])

  const style = {
    zIndex: zIndex + (isActive ? 1000 : 0),
    scale: store.scale,
    transitionProperty: !hasMounted
      ? ''
      : store.isActive
        ? 'scale'
        : 'scale, translate',
    transitionDuration: CARD_TRANSITION_DURATION + 'ms',
    translate: `${store.x}px ${store.y}px`,
    boxShadow:
      !store.isFaceDown && store.pileType === 'tableau'
        ? '0 0 5px rgba(0, 0, 0, 0.25)'
        : 'none',
  }

  if (!hasMounted) return null

  return (
    <div
      data-id={cardId}
      className={`card ${store.isFaceDown ? 'face-down' : ''} ${store.isDragging ? 'active' : 'inactive'}`}
      style={style}
    >
      <CardFront suit={store.suit} rank={store.rank} />
      <div className="card-back">
        <CardBackSVG />
      </div>
    </div>
  )
}

const getShallowCardState = (cardId: number) => (state: GameState) => {
  const card = state.cards[cardId]
  const { cardPileIndex, suit, rank } = card
  const { mouseX, mouseY, pressed } = state.cursorState
  const { x: xPos, y: yPos, pileType, width } = getCardPilePosition(card)

  const activeIndex = state.activeCard?.cardPileIndex ?? 0

  const yDiff =
    Math.abs(activeIndex - card.cardPileIndex) * (CARD_Y_GAP * width)
  const isActive = cardId === state.activeCard?.id
  const isFaceDown = cardId > state.shuffleIndex
  const isDragging = isActive && pressed

  const deckX = window.innerWidth / 2 - width / 2
  const deckY = window.innerHeight / 4

  const x = isFaceDown ? deckX : isDragging ? mouseX : xPos
  const y = isFaceDown ? deckY : isDragging ? mouseY + yDiff : yPos
  const scale = isActive ? 1.15 : 1

  return {
    x,
    y,
    scale,
    isActive,
    pileType,
    isFaceDown,
    cardPileIndex,
    suit,
    rank,
    isDragging,
  }
}

export default memo(Card)
