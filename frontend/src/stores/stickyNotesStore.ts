import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green'

export interface StickyNote {
  id: string
  content: string
  color: NoteColor
  createdAt: string
}

interface StickyNotesState {
  notes: StickyNote[]
  addNote: (content?: string, color?: NoteColor) => void
  updateNote: (id: string, content: string) => void
  removeNote: (id: string) => void
  setNoteColor: (id: string, color: NoteColor) => void
}

const DEFAULT_COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green']

function generateId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const useStickyNotesStore = create<StickyNotesState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (content = '', color) =>
        set((state) => {
          const newColor =
            color ??
            DEFAULT_COLORS[state.notes.length % DEFAULT_COLORS.length]
          return {
            notes: [
              ...state.notes,
              {
                id: generateId(),
                content,
                color: newColor,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),
      updateNote: (id, content) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, content } : n
          ),
        })),
      removeNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
      setNoteColor: (id, color) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, color } : n
          ),
        })),
    }),
    { name: 'dashboard-sticky-notes' }
  )
)
