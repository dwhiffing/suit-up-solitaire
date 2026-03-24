import { type ReactNode, useEffect, useRef, useState } from 'react'

export function Dropdown({
  className,
  label,
  items,
}: {
  className?: string
  label: ReactNode
  items: { label: ReactNode; onClick: () => void; active?: boolean; disabled?: boolean }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button className="w-full h-10" onClick={() => setOpen(!open)}>
        {label}
      </button>

      {/* Touch devices: invisible select overlay opens native picker */}
      <select
        className="absolute inset-0 opacity-0 hidden touch:block"
        value=""
        onChange={(e) => {
          const item = items[Number(e.target.value)]
          if (!item.disabled) item.onClick()
          e.target.value = ''
        }}>
        <option value="" disabled hidden />
        {items.map((item, i) => (
          <option key={i} value={i} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>

      {/* Desktop: custom dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-on-surface rounded shadow-lg min-w-full overflow-hidden">
          {items.map((item, i) => (
            <button
              key={i}
              disabled={item.disabled}
              className={`w-full px-4 py-2 whitespace-nowrap rounded-none text-right ${item.disabled ? 'opacity-30' : 'hover:bg-on-surface-active'} ${item.active ? 'bg-on-surface-active' : 'bg-transparent '}`}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
