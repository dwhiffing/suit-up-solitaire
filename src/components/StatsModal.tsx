import { formatTime, loadStorage, saveStorage } from '../utils'
import { DIFFICULTIES } from '../utils/constants'
import { useGameStore } from '../utils/gameStore'
import { Modal } from './Modal'

export const StatsModal = () => {
  const showStatsModal = useGameStore((state) => state.showStatsModal)
  const closeStats = useGameStore((state) => state.closeStats)

  const bestTimes = loadStorage('bestTimes')
  const winCounts = loadStorage('winCounts')

  return (
    <Modal show={showStatsModal} onClose={closeStats}>
      <div className="flex flex-col justify-between bg-surface rounded-lg shadow-xl w-full min-w-90 max-w-125 min-h-85 p-6 m-4">
        <div className="flex-1">
          <h2 className="text-3xl mb-4 font-bold">Statistics</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(DIFFICULTIES).map(([suits, label]) => {
              const bestTime = bestTimes[Number(suits)]
              const wins = winCounts[Number(suits)] ?? 0
              return (
                <div key={suits} className="flex items-baseline text-lg gap-4">
                  <span className="font-bold shrink-0">{label}</span>
                  <span className="flex-1 border-b relative -top-1 border-dashed border-white/30" />
                  <div className="flex gap-4 shrink-0">
                    <span>
                      {wins === 1 ? 'Win' : 'Wins'}:{' '}
                      <span className="font-bold">{wins} </span>
                    </span>
                    <span>
                      Best time:{' '}
                      <span className="font-mono font-bold">
                        {bestTime != null ? formatTime(bestTime, true) : '—'}
                      </span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            className="opacity-50"
            onClick={() => {
              if (
                window.confirm('Reset all statistics? This cannot be undone.')
              ) {
                saveStorage('bestTimes', {})
                saveStorage('winCounts', {})
                closeStats()
              }
            }}>
            Reset
          </button>
          <button onClick={closeStats}>Close</button>
        </div>
      </div>
    </Modal>
  )
}
