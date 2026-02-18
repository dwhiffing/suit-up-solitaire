import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../utils/gameStore'
import { formatTime } from '../utils'

export const Timer = () => {
  const { currentTime, incrementTimer, hasWon } = useGameStore(
    useShallow((state) => ({
      hasWon: state.winStartTime !== null,
      currentTime: state.currentTime,
      incrementTimer: state.incrementTimer,
    })),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !hasWon) incrementTimer()
    }, 1000)

    return () => clearInterval(interval)
  }, [incrementTimer, hasWon])

  return (
    <div className="font-mono text-white/50">{formatTime(currentTime)}</div>
  )
}
