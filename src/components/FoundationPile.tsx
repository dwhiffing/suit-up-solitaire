import { useGameStore } from '../utils/gameStore'
import { useDragStore } from '../utils/dragStore'
import { Card } from './Card'

interface FoundationPileProps {
  index: number
}

export function FoundationPile({ index }: FoundationPileProps) {
  const foundation = useGameStore((state) => state.foundations[index])
  const selectedCards = useGameStore((state) => state.selectedCards)
  const endDrag = useDragStore((state) => state.endDrag)

  const topCard =
    foundation.length > 0 ? foundation[foundation.length - 1] : null

  const handleClick = () => {
    if (selectedCards) {
      endDrag('foundation', index)
    }
  }

  const handleDrop = () => {
    endDrag('foundation', index)
  }

  return (
    <div
      onClick={handleClick}
      onMouseUp={handleDrop}
      className={`w-[100px] h-[140px] ${selectedCards ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {topCard ? (
        <Card card={topCard} isDraggable={false} />
      ) : (
        <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center text-white/50 text-xl font-bold">
          A
        </div>
      )}
    </div>
  )
}
