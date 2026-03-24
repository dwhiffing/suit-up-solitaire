import { useEffect, useState } from 'react'
import { useGameStore } from '../utils/gameStore'
import { Modal } from './Modal'

const INSTRUCTION_PAGES = [
  {
    title: 'Welcome to Suit Up!',
    content: (
      <>
        The goal of the game is to move the cards from the{' '}
        <b className="whitespace-nowrap">bottom piles</b> <i>(tableau)</i> to
        the <b>top piles</b> <i>(foundation)</i>, sorted by <b>suit</b> and{' '}
        <b>rank</b>
        .
        <br />
        <br />
        You may only move <b>exposed cards</b>, and only <b>one at a time</b>.
      </>
    ),
  },
  {
    title: 'Moving Cards',
    content: (
      <>
        A card may be moved to a card with the <b>same suit</b> that is{' '}
        <b>one rank higher or lower</b>, or to an <b>empty pile</b>.
        <br />
        <br />
        For example, a <b>3</b>
        <span className="text-heart">♥</span> may be moved onto either a{' '}
        <b>2</b>
        <span className="text-heart">♥</span>, a <b>4</b>
        <span className="text-heart">♥</span>, or an <b>empty pile</b>.
      </>
    ),
  },
  {
    title: 'Foundation Piles',
    content: (
      <>
        Foundations should start with <b>0 or 9</b>, then run <b>ascending</b>{' '}
        or <b>descending</b> respectively.
        <br />
        <br />
        <b>Empty foundations</b> may store an <b>invalid card</b>, but are
        <b> blocked</b> until the card is removed.
      </>
    ),
  },
  {
    title: 'Tips',
    content: (
      <>
        You may <b>double click</b> a card to <b>move it</b> to a{' '}
        <b>foundation pile</b>, assuming a valid pile is available.
        <br />
        <br />
        If you move a card that is part of a <b>suited run</b>, the rest of the
        cards will be <b>moved automatically</b>.
      </>
    ),
  },
]

export const InstructionsModal = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const showInstructionsModal = useGameStore(
    (state) => state.showInstructionsModal,
  )
  const closeInstructions = useGameStore((state) => state.closeInstructions)

  const handleNext = () => {
    if (currentPage < INSTRUCTION_PAGES.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      closeInstructions()
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleClose = () => {
    closeInstructions()
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (showInstructionsModal) setCurrentPage(0)
  }, [showInstructionsModal])

  return (
    <Modal show={showInstructionsModal} onClose={handleClose}>
      <div
        className="flex flex-col justify-between bg-surface rounded-lg shadow-xl w-[calc(100vw-40px)] min-w-90 max-w-125 min-h-72 p-4 lg:p-6"
        onClick={handleNext}>
        <div className="flex-1">
          <h2 className="text-2xl lg:text-3xl mb-4 font-bold">
            {INSTRUCTION_PAGES[currentPage].title}
          </h2>
          <p className="text-base lg:text-lg leading-relaxed whitespace-pre-line">
            {INSTRUCTION_PAGES[currentPage].content}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            className={currentPage === 0 ? 'opacity-0' : 'opacity-100'}
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            disabled={currentPage === 0}>
            Previous
          </button>

          <div className="flex gap-2">
            {INSTRUCTION_PAGES.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentPage ? 'bg-white/90' : 'bg-white/30'}`}
              />
            ))}
          </div>

          <button onClick={handleNext}>
            {currentPage === INSTRUCTION_PAGES.length - 1 ? 'Play' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
