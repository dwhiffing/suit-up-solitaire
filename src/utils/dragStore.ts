import { create } from 'zustand'
import { useGameStore } from './gameStore'

interface DragState {
  isDragging: boolean
  cards: CardType[]
  sourceType: PileType
  sourceIndex?: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  offsetX: number
  offsetY: number
  draggedCardId: string | null
}

interface DragStore extends DragState {
  startDrag: (
    cards: CardType[],
    sourceType: PileType,
    sourceIndex: number | undefined,
    e: React.MouseEvent,
  ) => void
  updatePosition: (x: number, y: number) => void
  endDrag: (targetType?: PileType, targetIndex?: number) => void
  reset: () => void
}

const initialState: DragState = {
  isDragging: false,
  cards: [],
  sourceType: 'waste',
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  offsetX: 0,
  offsetY: 0,
  draggedCardId: null,
}

export const useDragStore = create<DragStore>((set, get) => ({
  ...initialState,

  startDrag: (cards, sourceType, sourceIndex, e) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    // Select the cards in the game store
    useGameStore.getState().selectCards(cards, sourceType, sourceIndex)

    set({
      isDragging: true,
      cards,
      sourceType,
      sourceIndex,
      startX: rect.left,
      startY: rect.top,
      currentX: e.clientX,
      currentY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      draggedCardId: cards[0]?.id || null,
    })

    // Set up mouse move and mouse up listeners
    const handleMouseMove = (e: MouseEvent) => {
      get().updatePosition(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      const state = get()
      if (state.isDragging) {
        useGameStore.getState().deselectCards()
        get().reset()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  },

  updatePosition: (x, y) => {
    set({ currentX: x, currentY: y })
  },

  endDrag: (targetType, targetIndex) => {
    const state = get()
    console.log(targetIndex, targetType)
    if (!state.isDragging) return

    // Attempt to move if target provided
    if (targetType === 'foundation' && targetIndex !== undefined) {
      useGameStore.getState().moveToFoundation(targetIndex)
    } else if (targetType === 'tableau' && targetIndex !== undefined) {
      useGameStore.getState().moveToTableau(targetIndex)
    } else {
      useGameStore.getState().deselectCards()
    }

    get().reset()
  },

  reset: () => {
    set(initialState)
  },
}))
