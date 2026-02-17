import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../utils/gameStore'
import { formatTime } from '../utils'

export const Timer = () => {
  const state = useGameStore(
    useShallow((state) => ({
      gameStartTime: state.gameStartTime,
      winStartTime: state.winStartTime,
    })),
  )

  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const elapsed = state.winStartTime
    ? state.winStartTime - state.gameStartTime
    : currentTime - state.gameStartTime

  return (
    <div className="font-mono text-white/50">
      {formatTime(elapsed > 0 ? elapsed : 0)}
    </div>
  )
}
