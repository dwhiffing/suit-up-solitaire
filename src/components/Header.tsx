import { DEV_MODE, DIFFICULTIES } from '../utils/constants'
import { Dropdown } from './Dropdown'
import { HamburgerSVG } from './svg'
import { Timer } from './Timer'

export function Header({
  onReset,
  suitCount,
  onSuitCountChange,
  onAutoComplete,
  onOpenInstructions,
  onOpenStats,
}: {
  onReset: () => void
  suitCount: number
  onSuitCountChange: (count: number) => void
  onAutoComplete: () => void
  onOpenInstructions: () => void
  onOpenStats: () => void
}) {
  const currentDifficulty = DIFFICULTIES[suitCount as keyof typeof DIFFICULTIES]

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
            onClick: () => onSuitCountChange(Number(suits)),
            active: Number(suits) === suitCount,
          }))}
        />

        <Dropdown
          className="w-10"
          label={<HamburgerSVG />}
          items={[
            { label: 'New Game', onClick: onReset },
            { label: 'Stats', onClick: onOpenStats },
          ]}
        />
      </div>
    </div>
  )
}
