export function Header({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex justify-between items-center text-white p-5 relative z-[999]">
      <div>
        <span className="text-2xl">Solitaire</span>
      </div>

      <div
        onClick={onReset}
        className="flex items-center gap-1 cursor-pointer select-none h-10 justify-center text-xl"
      >
        <span>New Game</span>
      </div>
    </div>
  )
}
