import { DEV_MODE } from '../utils/constants'
import { Timer } from './Timer'

const DIFFICULTY_LEVELS = [
  { suits: 4, label: 'Easy (4)' },
  { suits: 5, label: 'Medium (5)' },
  { suits: 6, label: 'Hard (6)' },
  { suits: 7, label: 'Expert (7)' },
  { suits: 8, label: 'Diabolical (8)' },
]

export function Header({
  onReset,
  suitCount,
  onSuitCountChange,
  onAutoComplete,
  onOpenInstructions,
}: {
  onReset: () => void
  suitCount: number
  onSuitCountChange: (count: number) => void
  onAutoComplete: () => void
  onOpenInstructions: () => void
}) {
  return (
    <div className="flex justify-between items-center text-white p-5 relative z-[999] pointer-events-none">
      <div className="flex-1 flex items-center gap-3 pointer-events-auto">
        <span className="text-2xl">Suit up</span>
        <button onClick={onOpenInstructions} title="Instructions">
          ?
        </button>
      </div>

      <div
        className="flex-1 flex justify-center pointer-events-auto"
        onClick={() => DEV_MODE && onAutoComplete()}
      >
        <Timer />
      </div>

      <div className="flex-1 flex items-center justify-end gap-4 pointer-events-auto">
        <select
          value={suitCount}
          onChange={(e) => onSuitCountChange(Number(e.target.value))}
        >
          {DIFFICULTY_LEVELS.map((level) => (
            <option
              key={level.suits}
              value={level.suits}
              className="bg-gray-800"
            >
              {level.label}
            </option>
          ))}
        </select>

        <button onClick={onReset}>New Game</button>
      </div>
    </div>
  )
}
