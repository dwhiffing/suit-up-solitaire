import { useWindowEvent, useForceUpdate } from '../utils'
import Card from './Card'
import debounce from 'lodash/debounce'
import { Header } from './Header'
import { useGameStore } from '../utils/gameStore'
import { useShallow } from 'zustand/react/shallow'

function App() {
  const { cards, newGame, onMouseUp, onMouseDown, onMouseMove } = useGameStore(
    useShallow((state) => ({
      cards: state.cards,
      newGame: state.newGame,
      onMouseUp: state.onMouseUp,
      onMouseDown: state.onMouseDown,
      onMouseMove: state.onMouseMove,
    }))
  )

  useWindowEvent('resize', debounce(useForceUpdate(), 500))
  useWindowEvent('pointerup', onMouseUp)
  useWindowEvent('pointerdown', onMouseDown)
  useWindowEvent('pointermove', onMouseMove)

  return (
    <div>
      <Header onReset={() => newGame()} />

      {cards.map((card, cardIndex) => (
        <Card key={`card-${cardIndex}`} card={card} />
      ))}
    </div>
  )
}

export default App
