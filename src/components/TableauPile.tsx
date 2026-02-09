import { useGameStore } from '../utils/gameStore'
import { useDragStore } from '../utils/dragStore'
import { Card } from './Card'

interface TableauPileProps {
  index: number
}

export function TableauPile({ index }: TableauPileProps) {
  const pile = useGameStore((state) => state.tableau[index])
  const selectedCards = useGameStore((state) => state.selectedCards)
  const deselectCards = useGameStore((state) => state.deselectCards)
  const startDrag = useDragStore((state) => state.startDrag)
  const endDrag = useDragStore((state) => state.endDrag)
  const draggedCardId = useDragStore((state) => state.draggedCardId)

  const handlePileClick = () => {
    if (selectedCards) {
      console.log('a')
      endDrag('tableau', index)
    }
  }

  const handleCardClick = (cardIndex: number) => {
    const card = pile[cardIndex]

    if (!card.faceUp) return

    if (
      selectedCards?.sourceType === 'tableau' &&
      selectedCards.sourceIndex === index &&
      selectedCards.cards[0].id === card.id
    ) {
      deselectCards()
      return
    }
  }

  const handleMouseDown = (e: React.MouseEvent, cardIndex: number) => {
    const card = pile[cardIndex]
    if (!card.faceUp) return

    const cardsToMove = pile.slice(cardIndex)
    startDrag(cardsToMove, 'tableau', index, e)
  }

  const handleDrop = () => {
    endDrag('tableau', index)
  }

  const isCardSelected = (cardIndex: number): boolean => {
    if (
      !selectedCards ||
      selectedCards.sourceType !== 'tableau' ||
      selectedCards.sourceIndex !== index
    ) {
      return false
    }
    const card = pile[cardIndex]
    return selectedCards.cards.some((c) => c.id === card.id)
  }

  return (
    <div
      onClick={handlePileClick}
      onMouseUp={draggedCardId === pile.at(-1)?.id ? undefined : handleDrop}
      className={`min-h-[140px] w-[100px] relative ${draggedCardId === pile.at(-1)?.id ? 'pointer-events-none' : ''} ${selectedCards ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {pile.length === 0 ? (
        <div className="w-full h-[140px] border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center text-white/50 text-xl font-bold">
          K
        </div>
      ) : (
        pile.map((card, cardIndex) => (
          <div
            key={card.id}
            className="absolute"
            style={{ top: `${cardIndex * 25}px` }}
          >
            <Card
              card={card}
              isSelected={isCardSelected(cardIndex)}
              isDraggable={card.faceUp}
              onClick={() => handleCardClick(cardIndex)}
              onMouseDown={(e) => handleMouseDown(e, cardIndex)}
            />
          </div>
        ))
      )}
    </div>
  )
}
