import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const DEFAULT_COLUMNS = [
  { id: 'col-todo', title: 'To Do', cardIds: ['card-1', 'card-2'] },
  { id: 'col-inprogress', title: 'In Progress', cardIds: ['card-3'] },
  { id: 'col-review', title: 'In Review', cardIds: [] },
  { id: 'col-done', title: 'Done', cardIds: [] },
]

const DEFAULT_CARDS = {
  'card-1': {
    id: 'card-1',
    title: 'Setup Google Calendar integration',
    description: 'Connect the dashboard to Google Calendar API to sync tasks with calendar events.',
    dueDate: null,
    priority: 'high',
    labels: ['integration'],
    calendarEventId: null,
    notionPageId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'card-2': {
    id: 'card-2',
    title: 'Design Kanban board UI',
    description: 'Create wireframes and implement the Kanban board with drag-and-drop support.',
    dueDate: null,
    priority: 'medium',
    labels: ['design', 'frontend'],
    calendarEventId: null,
    notionPageId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'card-3': {
    id: 'card-3',
    title: 'Setup Notion integration',
    description: 'Connect to Notion API via proxy server to sync pages and tasks.',
    dueDate: null,
    priority: 'medium',
    labels: ['integration'],
    calendarEventId: null,
    notionPageId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

let cardIdCounter = 4

function generateId() {
  return `card-${Date.now()}-${cardIdCounter++}`
}

function generateColumnId() {
  return `col-${Date.now()}`
}

export const useBoardStore = create(
  persist(
    (set, get) => ({
      columns: DEFAULT_COLUMNS,
      cards: DEFAULT_CARDS,
      boardTitle: 'My Kanban Board',

      setBoardTitle: (title) => set({ boardTitle: title }),

      moveCard: (draggableId, source, destination) => {
        if (!destination) return
        if (
          source.droppableId === destination.droppableId &&
          source.index === destination.index
        ) return

        set((state) => {
          const columns = state.columns.map((col) => ({ ...col, cardIds: [...col.cardIds] }))
          const srcCol = columns.find((c) => c.id === source.droppableId)
          const dstCol = columns.find((c) => c.id === destination.droppableId)

          srcCol.cardIds.splice(source.index, 1)

          if (source.droppableId === destination.droppableId) {
            srcCol.cardIds.splice(destination.index, 0, draggableId)
          } else {
            dstCol.cardIds.splice(destination.index, 0, draggableId)
          }

          return { columns }
        })
      },

      addCard: (columnId, { title, description = '', priority = 'medium', labels = [], dueDate = null }) => {
        const id = generateId()
        const card = {
          id,
          title,
          description,
          priority,
          labels,
          dueDate,
          calendarEventId: null,
          notionPageId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          cards: { ...state.cards, [id]: card },
          columns: state.columns.map((col) =>
            col.id === columnId
              ? { ...col, cardIds: [...col.cardIds, id] }
              : col
          ),
        }))

        return id
      },

      updateCard: (cardId, updates) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        }))
      },

      deleteCard: (cardId) => {
        set((state) => {
          const { [cardId]: _, ...remainingCards } = state.cards
          return {
            cards: remainingCards,
            columns: state.columns.map((col) => ({
              ...col,
              cardIds: col.cardIds.filter((id) => id !== cardId),
            })),
          }
        })
      },

      addColumn: (title) => {
        const id = generateColumnId()
        set((state) => ({
          columns: [...state.columns, { id, title, cardIds: [] }],
        }))
      },

      updateColumn: (columnId, updates) => {
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, ...updates } : col
          ),
        }))
      },

      deleteColumn: (columnId) => {
        set((state) => {
          const col = state.columns.find((c) => c.id === columnId)
          const remainingCards = { ...state.cards }
          col?.cardIds.forEach((id) => delete remainingCards[id])
          return {
            cards: remainingCards,
            columns: state.columns.filter((c) => c.id !== columnId),
          }
        })
      },
    }),
    {
      name: 'kanban-board-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        columns: state.columns,
        cards: state.cards,
        boardTitle: state.boardTitle,
      }),
    }
  )
)
