import { useWindowEvent, useForceUpdate } from '../utils'
import Card from './Card'
import debounce from 'lodash/debounce'
import { Header } from './Header'
import { useGameStore } from '../utils/gameStore'
import { useShallow } from 'zustand/react/shallow'
import { CARD_WIDTH, PILE_COUNT } from '../utils/constants'

function App() {
  const state = useGameStore(
    useShallow((state) => ({
      cardCount: state.cards.length,
      newGame: state.newGame,
      onMouseUp: state.onMouseUp,
      onMouseDown: state.onMouseDown,
      onMouseMove: state.onMouseMove,
    })),
  )

  useWindowEvent('resize', debounce(useForceUpdate(), 200))
  useWindowEvent('pointerup', state.onMouseUp)
  useWindowEvent('pointerdown', state.onMouseDown)
  useWindowEvent('pointermove', state.onMouseMove)

  return (
    <>
      <div id="ui" className="absolute inset-0">
        <Header onReset={() => state.newGame()} />

        <div className="flex flex-col justify-center h-full">
          <div className="h-[300px] w-full flex gap-6 items-start justify-center">
            {Array.from({ length: PILE_COUNT }).map((_, pileIndex) => (
              <div
                key={`pile-${pileIndex}`}
                className="pile"
                data-pileindex={pileIndex}
                style={{ width: `${CARD_WIDTH}rem` }}
              />
            ))}
          </div>
          <div className="h-[300px] w-full flex gap-6 items-start justify-center">
            {Array.from({ length: PILE_COUNT }).map((_, pileIndex) => (
              <div
                key={`pile-${pileIndex}`}
                className="pile"
                data-pileindex={pileIndex + PILE_COUNT}
                style={{ width: `${CARD_WIDTH}rem` }}
              />
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
