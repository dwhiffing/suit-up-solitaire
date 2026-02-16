import { useWindowEvent, useForceUpdate } from '../utils'
import debounce from 'lodash/debounce'
import { Header } from './Header'
import { useGameStore } from '../utils/gameStore'
import { useShallow } from 'zustand/react/shallow'
import { PILE_COUNT } from '../utils/constants'
import { Pile } from './Pile'
import Card from './Card'

function App() {
  const state = useGameStore(
    useShallow((state) => ({
      cardCount: state.cards.length,
      suitCount: state.suitCount,
      setSuitCount: state.setSuitCount,
      newGame: state.newGame,
      onMouseUp: state.onMouseUp,
      onMouseDown: state.onMouseDown,
      onMouseMove: state.onMouseMove,
      autoCompleteGame: state.autoCompleteGame,
    })),
  )

  useWindowEvent('resize', debounce(useForceUpdate(), 100))
  useWindowEvent('pointerup', state.onMouseUp)
  useWindowEvent('pointerdown', state.onMouseDown)
  useWindowEvent('pointermove', state.onMouseMove)

  return (
    <>
      <div id="ui" className="absolute inset-0">
        <Header
          onReset={() => state.newGame(state.suitCount)}
          suitCount={state.suitCount}
          onSuitCountChange={state.setSuitCount}
          onAutoComplete={state.autoCompleteGame}
        />

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

          <div className="min-h-[24vw] w-full flex gap-board items-start justify-center">
            {Array.from({ length: PILE_COUNT }).map((_, index) => (
              <Pile key={index} pileIndex={index} pileType="tableau" />
            ))}
          </div>
        </div>
      </div>

      <div id="cards" className="absolute inset-0 pointer-events-none">
        {Array.from({ length: state.cardCount }).map((_, cardId) => (
          <Card key={`card-${cardId}`} cardId={cardId} />
        ))}
      </div>
    </>
  )
}

export default App
