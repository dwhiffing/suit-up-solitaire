import { useEffect, useState } from 'react'
import { useGameStore } from '../utils/gameStore'

const INSTRUCTION_PAGES = [
  {
    title: 'Welcome to Suit Up!',
    content:
      "The goal of the game is to move all the cards from the bottom 'tableau' piles to the top 'foundation' piles.\n\nThere is one foundation pile per suit.",
  },
  {
    title: 'How to Play',
    content:
      'A card may be moved to a card that is one rank higher or lower with a matching suit. \n\nYou can only move one card at a time.',
  },
  {
    title: 'How to Play',
    content:
      'Any card may be moved into an empty tableau pile.\n\nFoundation piles must either start with a 0 or a 9, then built ascending or descending respectively.',
  },
  {
    title: 'How to Play',
    content: `If you move a card, and it is part of a run of matching cards, the rest of the cards will automatically be moved for you.`,
  },
  {
    title: 'How to Play',
    content: `You may "cheat" by placing an invalid card into an empty foundation pile, but the pile will be disabled until you remove the invalid card.`,
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
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/20 z-[10000] transition-opacity duration-[500ms]"
      style={{
        opacity: showInstructionsModal ? 1 : 0,
        pointerEvents: showInstructionsModal ? 'all' : 'none',
      }}
      onClick={handleClose}
    >
      <div
        className="flex flex-col justify-between bg-[#45a173] rounded-lg shadow-xl w-[450px] h-[300px] p-8"
        onClick={(e) => {
          e.stopPropagation()
          handleNext()
        }}
      >
        <div className="flex-1">
          <h2 className="text-3xl mb-4">
            {INSTRUCTION_PAGES[currentPage].title}
          </h2>
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {INSTRUCTION_PAGES[currentPage].content}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            style={{ opacity: currentPage === 0 ? 0 : 1 }}
            disabled={currentPage === 0}
          >
            Previous
          </button>

          <div className="flex gap-2">
            {INSTRUCTION_PAGES.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    index === currentPage
                      ? 'rgba(255, 255, 255, 0.9)'
                      : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            ))}
          </div>

          <button onClick={handleNext}>
            {currentPage === INSTRUCTION_PAGES.length - 1 ? 'Play' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
