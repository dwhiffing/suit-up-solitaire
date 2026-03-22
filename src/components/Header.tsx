import { DEV_MODE, DIFFICULTIES } from '../utils/constants'
import { Timer } from './Timer'

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
    <div className="flex justify-between items-center text-white p-3 lg:p-5 relative z-header pointer-events-none">
      <div className="flex-1 flex items-center gap-3 pointer-events-auto">
        <span className="text-2xl whitespace-nowrap font-bold">Suit up</span>
        <button onClick={onOpenInstructions} title="Instructions">
          ?
        </button>
      </div>

      <div
        className="flex-1 flex justify-center pointer-events-auto"
        onClick={() => DEV_MODE && onAutoComplete()}>
        <Timer />
      </div>

      <div className="flex-1 flex items-center justify-end gap-4 pointer-events-auto">
        <select
          value={suitCount}
          onChange={(e) => onSuitCountChange(Number(e.target.value))}>
          {Object.entries(DIFFICULTIES).map(([suits, label]) => (
            <option key={suits} value={suits} className="bg-option-bg">
              {label} ({suits})
            </option>
          ))}
        </select>

        <button onClick={onReset}>
          <div className="md:hidden">+</div>
          <div className="hidden md:flex">New Game</div>
        </button>
      </div>
    </div>
  )
}
