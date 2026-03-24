import { useRef, useState } from 'react'
import { DEV_MODE, DIFFICULTIES } from '../utils/constants'
import { useGameStore } from '../utils/gameStore'
import { Dropdown } from './Dropdown'
import { HamburgerSVG } from './svg'
import { Timer } from './Timer'

export function Header() {
  const suitCount = useGameStore((s) => s.suitCount)
  const newGame = useGameStore((s) => s.newGame)
  const restartGame = useGameStore((s) => s.restartGame)
  const setSuitCount = useGameStore((s) => s.setSuitCount)
  const autoCompleteGame = useGameStore((s) => s.autoCompleteGame)
  const undo = useGameStore((s) => s.undo)
  const canUndo = useGameStore((s) => Boolean(s.undoMoves?.length))
  const openInstructions = useGameStore((s) => s.openInstructions)
  const openStats = useGameStore((s) => s.openStats)
  const seed = useGameStore((s) => s.seed ?? 0)
  const [showSeed, setShowSeed] = useState(false)
  const seedTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const currentDifficulty = DIFFICULTIES[suitCount as keyof typeof DIFFICULTIES]

  const handleTimerClick = () => {
    navigator.clipboard.writeText(seed.toString())
    setShowSeed(true)
    if (seedTimerRef.current) clearTimeout(seedTimerRef.current)
    seedTimerRef.current = setTimeout(() => setShowSeed(false), 3000)
  }

  const seedGame = () => {
    const input = prompt('Enter a seed:')
    if (input === null) return
    const seed = Number(input)
    if (!isNaN(seed) && input.trim() !== '') newGame(suitCount, seed)
  }

  return (
    <div className="flex justify-between items-center text-white p-3 lg:p-5 relative z-header pointer-events-none">
      <div className="flex-1 flex items-center gap-3 pointer-events-auto">
        <span className="text-2xl whitespace-nowrap font-bold">Suit up</span>
        <button onClick={openInstructions} title="Instructions">
          ?
        </button>
      </div>

      <div
        className="flex-1 flex justify-center pointer-events-auto cursor-pointer"
        onClick={handleTimerClick}>
        {showSeed ? (
          <div className="font-mono text-white/50">Seed: {seed}</div>
        ) : (
          <Timer />
        )}
      </div>

      <div className="flex-1 flex items-center justify-end gap-2 pointer-events-auto">
        <Dropdown
          className="w-30"
          label={
            <>
              {currentDifficulty} ({suitCount})
            </>
          }
          items={Object.entries(DIFFICULTIES).map(([suits, label]) => ({
            label: `${label} (${suits})`,
            onClick: () => setSuitCount(Number(suits)),
            active: Number(suits) === suitCount,
          }))}
        />

        <Dropdown
          className="w-10"
          label={<HamburgerSVG />}
          items={[
            { label: 'Undo', onClick: undo, disabled: !canUndo },
            {
              label: 'New Game',
              onClick: () => newGame(suitCount),
              onLongClick: seedGame,
            },
            { label: 'Restart', onClick: restartGame },
            { label: 'Stats', onClick: openStats },
            ...(DEV_MODE
              ? [{ label: 'Solve', onClick: autoCompleteGame }]
              : []),
          ]}
        />
      </div>
    </div>
  )
}
