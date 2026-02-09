import { StockPile } from './StockPile'
import { FoundationPile } from './FoundationPile'
import { TableauPile } from './TableauPile'
import { useGameStore } from '../utils/gameStore'

export function GameBoard() {
  const isWon = useGameStore((state) => state.isWon)
  const newGame = useGameStore((state) => state.newGame)
  return (
    <div className="flex flex-col gap-8 p-8 bg-green-600 min-h-screen overflow-x-auto">
      <div className="flex justify-center items-center">
        <div className="flex gap-4 items-center">
          <button
            onClick={newGame}
            className="px-5 py-2.5 text-base font-bold bg-blue-500 hover:bg-blue-600 text-white border-none rounded cursor-pointer transition-colors duration-200"
          >
            New Game
          </button>

          {isWon && (
            <div className="px-5 py-2.5 text-lg font-bold text-green-600 bg-green-600/20 rounded border-2 border-green-600">
              You Won!
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-start gap-4 flex-wrap">
        <StockPile />

        <div className="flex gap-4">
          <FoundationPile index={0} />
          <FoundationPile index={1} />
          <FoundationPile index={2} />
          <FoundationPile index={3} />
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-[500px]">
        <TableauPile index={0} />
        <TableauPile index={1} />
        <TableauPile index={2} />
        <TableauPile index={3} />
        <TableauPile index={4} />
        <TableauPile index={5} />
        <TableauPile index={6} />
      </div>
    </div>
  )
}
