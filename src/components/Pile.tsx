export const Pile = ({
  pileIndex,
  pileType,
}: {
  pileIndex: number
  pileType: 'foundation' | 'tableau'
}) => (
  <div
    key={`pile-${pileIndex}`}
    className={`pile ${pileType}`}
    data-pileindex={pileIndex}
    data-piletype={pileType}
  >
    {pileType === 'foundation' && (
      <div className="text-[#fff4] absolute inset-0 flex items-center justify-center pointer-events-none text-[calc(var(--base-size)*0.4)]">
        0/9
      </div>
    )}
  </div>
)
