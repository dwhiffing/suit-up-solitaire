export function Header({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex justify-between items-center text-white p-5">
      <div>
        <span>Solitaire</span>
      </div>

      <div>
        <span onClick={onReset}>+</span>
      </div>
    </div>
  )
}
