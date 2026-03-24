import { useShallow } from 'zustand/shallow'
import { formatTime, loadStorage } from '../utils'
import { DIFFICULTIES } from '../utils/constants'
import { useGameStore } from '../utils/gameStore'
import { Modal } from './Modal'

export const WinModal = () => {
  const state = useGameStore(
    useShallow((state) => ({
      showWinModal: state.showWinModal,
      suitCount: state.suitCount,
      newGame: state.newGame,
      currentTime: state.currentTime,
      bestTime: loadStorage('bestTimes')[state.suitCount],
      winCount: loadStorage('winCounts')[state.suitCount] ?? 1,
    })),
  )

  return (
    <Modal show={state.showWinModal}>
      <div className="flex flex-col justify-center items-center gap-5 bg-surface rounded-lg shadow-xl min-w-75 min-h-50 p-8">
        <h2 className="text-4xl font-bold">
          {DIFFICULTIES[state.suitCount] || ''} Cleared!
        </h2>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-mono text-center font-bold">
            <span>Win #{state.winCount}</span>
            <br />
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
    </Modal>
  )
}
