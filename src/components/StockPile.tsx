import { useGameStore } from '../utils/gameStore'
import { useDragStore } from '../utils/dragStore'
import { Card } from './Card'

export function StockPile() {
  const stock = useGameStore((state) => state.stock)
  const waste = useGameStore((state) => state.waste)
  const selectedCards = useGameStore((state) => state.selectedCards)
  const drawCard = useGameStore((state) => state.drawCard)
  const deselectCards = useGameStore((state) => state.deselectCards)
  const startDrag = useDragStore((state) => state.startDrag)

  const topWasteCard = waste.length > 0 ? waste[waste.length - 1] : null
  const isWasteCardSelected =
    selectedCards?.sourceType === 'waste' &&
    topWasteCard?.id === selectedCards.cards[0]?.id

  const handleStockClick = () => {
    drawCard()
  }

  const handleWasteClick = () => {
    if (!topWasteCard) return

    if (isWasteCardSelected) {
      deselectCards()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!topWasteCard) return
    startDrag([topWasteCard], 'waste', undefined, e)
  }

  return (
    <div className="flex gap-4">
      {/* Stock pile */}
      <div
        onClick={handleStockClick}
        className="w-[100px] h-[140px] cursor-pointer"
      >
        <div className="pointer-events-none">
          {stock.length > 0 ? (
            <Card card={stock[stock.length - 1]} isDraggable={false} />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center text-white/50 text-xs">
              Reset
            </div>
          )}
        </div>
      </div>

      {/* Waste pile */}
      <div className="w-[100px] h-[140px]">
        {topWasteCard ? (
          <Card
            card={topWasteCard}
            isSelected={isWasteCardSelected}
            isDraggable={true}
            onClick={handleWasteClick}
            onMouseDown={handleMouseDown}
          />
        ) : (
          <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg" />
        )}
      </div>
    </div>
  )
}
