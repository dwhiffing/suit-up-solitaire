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
          className="bg-white/10 text-white px-3 py-2 rounded cursor-pointer text-lg border border-white/20 hover:bg-white/20 transition-colors"
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

        <div
          onClick={onAutoComplete}
          className="flex items-center gap-1 cursor-pointer select-none h-10 justify-center text-xl hover:opacity-80 transition-opacity"
        >
          <span>Auto-Complete</span>
        </div>

        <div
          onClick={onReset}
          className="flex items-center gap-1 cursor-pointer select-none h-10 justify-center text-xl hover:opacity-80 transition-opacity"
        >
          <span>New Game</span>
        </div>
      </div>
    </div>
  )
}
