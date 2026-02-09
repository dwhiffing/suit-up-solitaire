import { useDragStore } from '../utils/dragStore'

interface CardProps {
  card: CardType
  isSelected?: boolean
  isDraggable?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
}

const CARD_WIDTH = 100
const CARD_HEIGHT = 140
const CORNER_RADIUS = 8
const CIRCLE_RADIUS = 35

const SUIT_COLORS: Record<Suit, string> = {
  red: '#e74c3c',
  black: '#2c3e50',
  green: '#27ae60',
  blue: '#3498db',
}

export function Card({
  card,
  isSelected = false,
  isDraggable = false,
  onClick,
  onDoubleClick,
  onMouseDown,
}: CardProps) {
  const dragState = useDragStore()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return
    e.stopPropagation()
    onMouseDown?.(e)
  }

  const isDisabled = !isDraggable && !card.faceUp

  const isPartOfDragGroup =
    dragState.isDragging &&
    dragState.cards.some((c: CardType) => c.id === card.id)

  let transform = ''
  let zIndex = 0
  let transition = 'transform 0.2s'

  if (isPartOfDragGroup) {
    const deltaX = dragState.currentX - dragState.startX - dragState.offsetX
    const deltaY = dragState.currentY - dragState.startY - dragState.offsetY
    transform = `translate(${deltaX}px, ${deltaY}px)`
    zIndex = 1000
    transition = ''
  }

  const className = `
    w-[100px] h-[140px] cursor-pointer select-none relative
    ${isSelected && !isPartOfDragGroup ? 'outline outline-[3px] outline-blue-500 rounded-lg' : ''}
    ${isDisabled ? 'cursor-not-allowed opacity-80' : ''}
  `.trim()

  return (
    <div
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      style={{ transform, zIndex, transition }}
    >
      <div className="pointer-events-none block">
        {card.faceUp ? (
          <CardFront suit={card.suit} rank={card.rank} />
        ) : (
          <CardBack />
        )}
      </div>
    </div>
  )
}

function CardFront({ suit, rank }: { suit: Suit; rank: Rank }) {
  const color = SUIT_COLORS[suit]

  return (
    <svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
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

function CardBack() {
  return (
    <svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx={CORNER_RADIUS}
        fill="#34495e"
        stroke="#333"
        strokeWidth="2"
      />
    </svg>
  )
}
