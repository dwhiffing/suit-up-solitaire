import React from 'react'
import {
  SUIT_COLORS,
  SVG_CARD_WIDTH,
  SVG_CARD_HEIGHT,
} from '../../utils/constants'

const _CardFront = ({ suit, rank }: { suit: Suit; rank: Rank }) => {
  const color = SUIT_COLORS[suit]

  return (
    <svg
      viewBox={`0 0 ${SVG_CARD_WIDTH} ${SVG_CARD_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none w-full h-full select-none"
    >
      <rect width={SVG_CARD_WIDTH} height={SVG_CARD_HEIGHT} fill="white" />

      <text
        x="6"
        y="18"
        fontSize="18"
        fontWeight="bold"
        fill={color}
        fontFamily="Arial, sans-serif"
      >
        {rank}
      </text>

      <circle cx="25" cy="12" r={5} fill={color} />

      <circle
        cx={SVG_CARD_WIDTH / 2}
        cy={SVG_CARD_HEIGHT / 2}
        r={SVG_CARD_WIDTH / 4}
        fill={color}
      />

      <text
        x={SVG_CARD_WIDTH / 2}
        y={SVG_CARD_HEIGHT / 2}
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

export const CardFront = React.memo(_CardFront)

export const CardBack = () => (
  <svg
    viewBox={`0 0 ${SVG_CARD_WIDTH} ${SVG_CARD_HEIGHT}`}
    xmlns="http://www.w3.org/2000/svg"
    className="pointer-events-none w-full h-full select-none"
  >
    <rect width={SVG_CARD_WIDTH} height={SVG_CARD_HEIGHT} fill="#34495e" />
  </svg>
)
