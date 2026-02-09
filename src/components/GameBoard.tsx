import { useState, useRef } from 'react'
import {
  shuffleDeck,
  useWindowEvent,
  moveCard,
  getCardIsActive,
  getCardFromPoint,
  useForceUpdate,
  getBottomCard,
  getCardPosition,
} from '../utils'
import Card from './Card'
import debounce from 'lodash/debounce'
import { Header } from './Header'

const EMPTY_CARDS = [0, 1, 2, 3, 4, 5].map((n) => ({
  cardPileIndex: -1,
  pileIndex: n,
  rank: -1,
  suit: -1,
  index: -1,
})) as CardType[]

type MouseParams = { clientX: number; clientY: number }

function App() {
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [cursorState, setCursorState] = useState({ mouseY: 0, mouseX: 0 })
  const startRef = useRef({ x: 0, y: 0 })
  const deltaRef = useRef({ x: 0, y: 0 })
  const [cards, setCards] = useState(shuffleDeck())

  const onMouseDown = ({ clientX, clientY }: MouseParams) => {
    const card = getCardFromPoint(clientX, clientY, cards)

    if (!card) {
      return setActiveCard(null)
    }

    if (activeCard) {
      const bottomCard = getBottomCard(card, cards)
      if (bottomCard) setCards(moveCard(cards, activeCard, bottomCard))

      setActiveCard(null)
    } else {
      setActiveCard(card)
    }
    const { x: mouseX, y: mouseY } = getCardPosition(card)
    startRef.current = { x: clientX, y: clientY }
    deltaRef.current = { x: clientX - mouseX, y: clientY - mouseY }

    setCursorState({ mouseX, mouseY })
  }

  const onMouseMove = ({ clientY, clientX }: MouseParams) => {
    const mouseY = clientY - deltaRef.current.y
    const mouseX = clientX - deltaRef.current.x
    setCursorState({ mouseY, mouseX })
  }

  const onMouseUp = ({ clientX, clientY }: MouseParams) => {
    const diffX = Math.abs(startRef.current.x - clientX)
    const diffY = Math.abs(startRef.current.y - clientY)
    const passedThreshold = diffX > 15 || diffY > 15

    deltaRef.current = { x: 0, y: 0 }

    if (activeCard) {
      let clickedCard = getCardFromPoint(clientX, clientY, cards)
      if (clickedCard) {
        clickedCard = getBottomCard(clickedCard, cards)!
        setCards(moveCard(cards, activeCard, clickedCard))
      }
      if (passedThreshold) {
        setActiveCard(null)
      }
    }
  }

  useWindowEvent('resize', debounce(useForceUpdate(), 500))
  useWindowEvent('pointerup', onMouseUp)
  useWindowEvent('pointerdown', onMouseDown)
  useWindowEvent('pointermove', onMouseMove)

  return (
    <div>
      <Header onReset={() => setCards(shuffleDeck())} />

      {[0, 1, 2, 3, 4, 5].map((n) => (
        <Card key={`pile-${n}`} card={EMPTY_CARDS[n]} activeCard={null} />
      ))}

      {cards.map((card, cardIndex) => {
        return (
          <Card
            key={`card-${cardIndex}`}
            card={card}
            activeCard={activeCard}
            mouseX={getCardIsActive(activeCard, card) ? cursorState.mouseX : -1}
            mouseY={getCardIsActive(activeCard, card) ? cursorState.mouseY : -1}
          />
        )
      })}
    </div>
  )
}

export default App
