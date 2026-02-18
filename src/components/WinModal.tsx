import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../utils/gameStore'
import { formatTime, loadBestTimes } from '../utils'
import { DIFFICULTIES } from '../utils/constants'

export const WinModal = () => {
  const state = useGameStore(
    useShallow((state) => ({
      showWinModal: state.showWinModal,
      suitCount: state.suitCount,
      newGame: state.newGame,
      currentTime: state.currentTime,
      bestTime: loadBestTimes()[state.suitCount],
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
      <div className="flex flex-col justify-center items-center gap-5 bg-[#45a173] rounded-lg shadow-xl min-w-[300px] min-h-[200px] p-8">
        <h2 className="text-4xl font-bold">
          {DIFFICULTIES[state.suitCount] || ''} Cleared!
        </h2>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-mono font-bold">
            <span>Time: {formatTime(state.currentTime, true)}</span>
            <br />
            {state.bestTime && (
              <span className="text-white/50">
                Best: {formatTime(state.bestTime, true)}
              </span>
            )}
          </p>
        </div>
        <button onClick={() => state.newGame(state.suitCount)}>New Game</button>
      </div>
    </div>
  )
}
