export const Pile = ({
  pileIndex,
  pileType,
}: {
  pileIndex: number
  pileType: 'foundation' | 'tableau'
}) => {
  return (
    <div
      key={`pile-${pileIndex}`}
      className={`pile ${pileType}`}
      data-pileindex={pileIndex}
      data-piletype={pileType}>
      {pileType === 'foundation' && (
        <div className="text-on-surface-pile absolute inset-0 flex items-center justify-center pointer-events-none text-(length:--card-pile-label-size) font-bold">
          0/9
        </div>
      )}
    </div>
  )
}
