import { DEV_MODE } from '../utils/constants'

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
}: {
  onReset: () => void
  suitCount: number
  onSuitCountChange: (count: number) => void
  onAutoComplete: () => void
}) {
  return (
    <div className="flex justify-between items-center text-white p-5 relative z-[999]">
      <div>
        <span className="text-2xl">Suit up</span>
      </div>

      <div className="flex items-center gap-4">
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

        {DEV_MODE && <button onClick={onAutoComplete}>Auto-Complete</button>}
        <button onClick={onReset}>New Game</button>
      </div>
    </div>
  )
}
