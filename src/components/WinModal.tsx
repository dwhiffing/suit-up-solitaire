import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../utils/gameStore'

export const WinModal = () => {
  const state = useGameStore(
    useShallow((state) => ({
      showWinModal: state.showWinModal,
      suitCount: state.suitCount,
      newGame: state.newGame,
    })),
  )
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/20 z-[10000] transition-opacity duration-[500ms]"
      style={{
        opacity: state.showWinModal ? 1 : 0,
        pointerEvents: state.showWinModal ? 'all' : 'none',
      }}
    >
      <div className="flex flex-col justify-center items-center gap-5 bg-[#45a173] rounded-lg shadow-xl min-w-[300px] min-h-[200px]">
        <h2 className="text-4xl">You win!</h2>
        <button onClick={() => state.newGame(state.suitCount)}>New Game</button>
      </div>
    </div>
  )
}
