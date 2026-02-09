import React from 'react'
import { getCardPosition, useWindowEvent, useForceUpdate } from '../utils'
import debounce from 'lodash/debounce'
import { useGameStore } from '../utils/gameStore'
import { CARD_Y_GAP } from '../utils/constants'
import { useShallow } from 'zustand/react/shallow'

const Card = ({ card }: { card: CardType }) => {
  useWindowEvent('resize', debounce(useForceUpdate(), 500))

  const { zIndex, transitionProperty, pointerEvents, x, y, scale } =
    useGameStore(
      useShallow((state) => {
        const { activeCard } = state
        const { pressed, mouseX, mouseY } = state.cursorState
        const { x: xPos, y: yPos } = getCardPosition(card)

        const isActive = activeCard
          ? activeCard.pileIndex === card.pileIndex &&
            activeCard.cardPileIndex <= card.cardPileIndex
          : false
        const isDragging = pressed && isActive
        const pileDiff = Math.abs(
          (activeCard?.cardPileIndex ?? 0) - card.cardPileIndex,
        )
        const yOffset = isDragging ? CARD_Y_GAP * pileDiff : 0
        return {
          x: isDragging ? mouseX : xPos,
          y: isDragging ? mouseY + yOffset : yPos,
          zIndex: isDragging ? 35 + card.cardPileIndex : card.cardPileIndex,
          transitionProperty: isDragging ? 'scale' : 'scale, translate',
          pointerEvents: (isDragging ? 'none' : 'auto') as 'none' | 'auto',
          scale: isActive ? 1.185 : 1,
        }
      }),
    )

  const isFaceUp = true

  return (
    <div
      data-index={card.index}
      data-pileindex={card.pileIndex}
      className="card absolute overflow-hidden w-[3.875rem]"
      style={{
        scale,
        zIndex,
        translate: `${x}px ${y}px`,
        transitionProperty,
        transitionDuration: '0.3s',
        transitionTimingFunction: 'ease-in-out',
        boxShadow: '0 -0 5px rgba(0, 0, 0, 0.25)',
        pointerEvents,
        borderRadius: '0.3rem',
        border: '0.08rem solid #333',
      }}
    >
      {isFaceUp ? (
        <CardFront suit={card.suit} rank={card.rank} />
      ) : (
        <CardBack />
      )}
    </div>
  )
}

const CARD_WIDTH = 100
const CARD_HEIGHT = 140
const CIRCLE_RADIUS = 35
const SUIT_COLORS: string[] = ['#e74c3c', '#2c3e50', '#27ae60', '#3498db']

function CardFront({ suit, rank }: { suit: Suit; rank: Rank }) {
  const color = SUIT_COLORS[suit]

  return (
    <svg
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none w-full h-full select-none"
    >
      <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="white" />

      <text
        x="8"
        y="18"
        fontSize="16"
        fontWeight="bold"
        fill={color}
        fontFamily="Arial, sans-serif"
      >
        {rank}
      </text>

      <circle
        cx={CARD_WIDTH / 2}
        cy={CARD_HEIGHT / 2}
        r={CIRCLE_RADIUS}
        fill={color}
      />

      <text
        x={CARD_WIDTH / 2}
        y={CARD_HEIGHT / 2}
        fontSize="24"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial, sans-serif"
      >
        {rank}
      </text>
    </svg>
  )
}

function CardBack() {
  return (
    <svg
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none w-full h-full select-none"
    >
      <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="#34495e" />
    </svg>
  )
}

export default React.memo(Card)
