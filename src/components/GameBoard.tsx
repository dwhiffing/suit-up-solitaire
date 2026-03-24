import debounce from 'lodash/debounce'
import { useShallow } from 'zustand/react/shallow'
import { useForceUpdate, useWindowEvent } from '../utils'
import { PILE_COUNT } from '../utils/constants'
import { useGameStore } from '../utils/gameStore'
import Card from './Card'
import { Header } from './Header'
import { InstructionsModal } from './InstructionsModal'
import { Pile } from './Pile'
import { StatsModal } from './StatsModal'
import { WinModal } from './WinModal'

function App() {
  const state = useGameStore(
    useShallow((state) => ({
      cardCount: state.cards.length,
      suitCount: state.suitCount,
      onMouseUp: state.onMouseUp,
      onMouseDown: state.onMouseDown,
      onMouseMove: state.onMouseMove,
    })),
  )

  useWindowEvent('resize', debounce(useForceUpdate(), 100))
  useWindowEvent('pointerup', state.onMouseUp)
  useWindowEvent('pointerdown', state.onMouseDown)
  useWindowEvent('pointermove', state.onMouseMove)

  return (
    <>
      <div id="ui" className="absolute inset-0">
        <Header />

        <div className="flex flex-col justify-center h-full gap-board absolute inset-0">
          <div className="w-full flex gap-board items-start justify-center">
            {Array.from({ length: state.suitCount }).map((_, index) => (
              <Pile
                key={index}
                pileIndex={index + PILE_COUNT}
                pileType="foundation"
              />
            ))}
          </div>

          <div className="min-h-[20vw] w-full flex gap-board items-start justify-center">
            {Array.from({ length: PILE_COUNT }).map((_, index) => (
              <Pile key={index} pileIndex={index} pileType="tableau" />
            ))}
          </div>
        </div>
      </div>

      <div id="cards" className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: state.cardCount }).map((_, cardId) => (
          <Card key={`card-${cardId}`} cardId={cardId} />
        ))}
      </div>

      <WinModal />
      <InstructionsModal />
      <StatsModal />
    </>
  )
}

export default App
