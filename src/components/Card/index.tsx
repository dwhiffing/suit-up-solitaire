import { useEffect, useState, memo } from 'react'
import debounce from 'lodash/debounce'
import { useShallow } from 'zustand/react/shallow'

import { CardBackSVG, CardFront } from './svg'
import {
  getCardPilePosition,
  useWindowEvent,
  useForceUpdate,
  getWinAnimationDelay,
} from '../../utils'
import {
  useGameStore,
  type GameState,
  isPileComplete,
} from '../../utils/gameStore'
import { CARD_TRANSITION_DURATION, NUM_RANKS } from '../../utils/constants'

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

  if (!hasMounted) return null

  const translate = `${store.x}px ${store.y}px`
  const boxShadow =
    !store.isFaceDown && store.pileType === 'tableau'
      ? '0 0 5px rgba(0, 0, 0, 0.25)'
      : 'none'
  const transitionDuration = CARD_TRANSITION_DURATION + 'ms'
  const transitionTimingFunction =
    store.winAnimationPhase === 1 ? 'linear' : 'cubic-bezier(0.4, 0, 0.6, 1)'
  const transitionProperty =
    store.disableTransition || !hasMounted
      ? 'none'
      : store.isActive
        ? 'scale'
        : 'scale, translate'
  const transitionDelay =
    store.winAnimationPhase === 0 ? `${store.transitionDelay}ms` : '0ms'

  return (
    <div
      data-id={cardId}
      className={`card ${store.isFaceDown ? 'face-down' : ''} ${store.isDragging ? 'active' : 'inactive'}`}
      style={{
        zIndex: zIndex + (isActive || store.winAnimationPhase > -1 ? 1000 : 0),
        scale: store.scale,
        transitionProperty,
        transitionDuration,
        transitionTimingFunction,
        transitionDelay,
        translate,
        boxShadow,
      }}
    >
      <CardFront suit={store.suit} rank={store.rank} />
      <div className="card-back">
        <CardBackSVG />
      </div>
    </div>
  )
}

const getShallowCardState =
  (cardId: number) =>
  (state: GameState): CardShallowState => {
    const card = state.cards[cardId]

    if (state.winStartTime !== null)
      return getCardWinAnimationState(card, state)

    const { cardPileIndex, suit, rank } = card
    const { mouseX, mouseY, pressed } = state.cursorState
    const { x: xPos, y: yPos, pileType, width } = getCardPilePosition(card)
    const isActive = cardId === state.activeCard?.id
    const isShuffling = cardId > state.shuffleIndex
    const isInCompletedPile = isPileComplete(card.pileIndex, state.cards)
    const isFaceDown = isShuffling || isInCompletedPile
    const isDragging = isActive && pressed

    const deckX = window.innerWidth / 2 - width / 2
    const deckY = window.innerHeight / 4

    const x = isShuffling ? deckX : isDragging ? mouseX : xPos
    const y = isShuffling ? deckY : isDragging ? mouseY : yPos
    const scale = isActive ? 1.15 : 1

    return {
      x,
      y,
      scale,
      isActive,
      isDragging,
      pileType,
      isFaceDown,
      cardPileIndex,
      suit,
      rank,
      winAnimationPhase: -1,
      disableTransition: false,
      transitionDelay: 0,
    }
  }

export default memo(Card)

const getCardWinAnimationState = (card: CardType, state: GameState) => {
  const { width: cardWidth, height: cardHeight } = getCardPilePosition(card)
  const index = card.suit * NUM_RANKS + card.rank
  const numRows = state.cards.length / NUM_RANKS
  const rowIndex = Math.floor(index / NUM_RANKS)
  const colIndex = index % NUM_RANKS
  const offset = colIndex / NUM_RANKS
  const progress = (state.winAnimProgress + offset) % 1
  const disableTransition = progress < 0.02

  const totalWidth = window.innerWidth + cardWidth * 3
  let gap = (totalWidth - cardWidth * NUM_RANKS) / NUM_RANKS
  let totalHeight = numRows * cardHeight + (numRows - 1) * gap
  let yOffset = (window.innerHeight - totalHeight) / 2

  // if the cards would go off the top of the screen, reduce the gap and scale down the cards
  let scale = 1
  if (yOffset < -cardHeight / 2) {
    yOffset = -cardHeight / 2
    totalHeight = window.innerHeight - 2 * yOffset
    gap = (totalHeight - numRows * cardHeight) / (numRows - 1)
    scale = 0.9
  }

  const x =
    rowIndex % 2 === 0
      ? // even rows move right
        -cardWidth * 2 + progress * totalWidth
      : // odd rows move left
        window.innerWidth + cardWidth - progress * totalWidth

  const y = rowIndex * (cardHeight + gap) + yOffset

  const transitionDelay = getWinAnimationDelay(card.suit, card.rank)
  const winSetupComplete =
    Date.now() - state.winStartTime! >
    getWinAnimationDelay(state.suitCount - 1, NUM_RANKS - 1)

  return {
    x,
    y,
    scale,
    isActive: false,
    isDragging: false,
    pileType: 'foundation',
    isFaceDown: !winSetupComplete,
    cardPileIndex: card.cardPileIndex,
    suit: card.suit,
    rank: card.rank,
    winAnimationPhase: !winSetupComplete ? 0 : 1,
    disableTransition,
    transitionDelay,
  }
}
