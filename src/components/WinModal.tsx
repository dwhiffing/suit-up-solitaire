import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../utils/gameStore'
import { formatTime } from '../utils'

export const WinModal = () => {
  const state = useGameStore(
    useShallow((state) => ({
      showWinModal: state.showWinModal,
      suitCount: state.suitCount,
      newGame: state.newGame,
      gameStartTime: state.gameStartTime,
      winStartTime: state.winStartTime,
    })),
  )

  const elapsedTime = state.winStartTime
    ? formatTime(state.winStartTime - state.gameStartTime)
    : '00:00'

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/20 z-[10000] transition-opacity duration-[500ms]"
      style={{
        opacity: state.showWinModal ? 1 : 0,
        pointerEvents: state.showWinModal ? 'all' : 'none',
      }}
    >
      <div className="flex flex-col justify-center items-center gap-5 bg-[#45a173] rounded-lg shadow-xl min-w-[300px] min-h-[200px] p-8">
        <h2 className="text-4xl">You win!</h2>
        <p className="text-2xl font-mono">{elapsedTime}</p>
        <button onClick={() => state.newGame(state.suitCount)}>New Game</button>
      </div>
    </div>
  )
}
