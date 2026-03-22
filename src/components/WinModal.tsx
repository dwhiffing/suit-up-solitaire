import { useShallow } from 'zustand/shallow'
import { formatTime, loadBestTimes } from '../utils'
import { DIFFICULTIES } from '../utils/constants'
import { useGameStore } from '../utils/gameStore'

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
    <div className={`modal-backdrop ${state.showWinModal ? '' : 'hidden'}`}>
      <div className="flex flex-col justify-center items-center gap-5 bg-surface rounded-lg shadow-xl min-w-75 min-h-50 p-8">
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
