export const Pile = ({
  pileIndex,
  pileType,
}: {
  pileIndex: number
  pileType: 'foundation' | 'tableau'
}) => (
  <div
    key={`pile-${pileIndex}`}
    className="pile"
    data-pileindex={pileIndex}
    data-piletype={pileType}
  />
)
