import React from 'react'
import {
  getCardPosition,
  getCardSpacing,
  useWindowEvent,
  useForceUpdate,
  getCardIsActive,
} from '../utils'
import debounce from 'lodash/debounce'

const Card = ({
  card,
  activeCard,
  mouseX = -1,
  mouseY = -1,
}: {
  card: CardType
  activeCard: CardType | null
  mouseX?: number
  mouseY?: number
}) => {
  useWindowEvent('resize', debounce(useForceUpdate(), 500))
  const { height } = getCardSpacing()
  const { x: xPos, y: yPos } = getCardPosition(card)
  const isActive = getCardIsActive(activeCard, card)

  const yOffset =
    mouseX > -1 && activeCard
      ? height * Math.abs(activeCard.cardPileIndex - card.cardPileIndex)
      : 0

  const isDragging = mouseX > -1
  const x = isDragging ? mouseX : xPos
  const y = isDragging ? mouseY + yOffset : yPos
  const scale = isActive ? 1.185 : 1
  const zIndex = mouseX > -1 ? 35 + card.cardPileIndex : card.cardPileIndex
  const transitionProperty = isDragging ? 'scale' : 'scale, translate'

  return (
    <div
      data-index={card.index}
      data-pileindex={card.pileIndex}
      className="absolute w-[3.875rem] h-[5.5rem] shadow-xl"
      style={{
        scale,
        zIndex,
        translate: `${x}px ${y}px`,
        transitionProperty,
        transitionDuration: '0.3s',
        transitionTimingFunction: 'ease-in-out',
        boxShadow: '0 -0 5px rgba(0, 0, 0, 0.25)',
        pointerEvents: isActive ? 'none' : 'auto',
      }}
    >
      <CardFront suit={card.suit} rank={card.rank} />
      {/* <CardBack /> */}
    </div>
  )
}

const CARD_WIDTH = 100
const CARD_HEIGHT = 140
const CORNER_RADIUS = 8
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
      <rect
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx={CORNER_RADIUS}
        fill="white"
        stroke="#333"
        strokeWidth="2"
      />

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

// function CardBack() {
//   return (
//     <svg
//       viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
//       xmlns="http://www.w3.org/2000/svg"
//       className="pointer-events-none w-full h-full select-none"
//     >
//       <rect
//         width={CARD_WIDTH}
//         height={CARD_HEIGHT}
//         rx={CORNER_RADIUS}
//         fill="#34495e"
//         stroke="#333"
//         strokeWidth="2"
//       />
//     </svg>
//   )
// }

export default React.memo(Card)
