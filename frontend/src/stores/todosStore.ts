import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Todo {
  id: string
  title: string
  done: boolean
  createdAt: string
}

interface TodosState {
  todos: Todo[]
  addTodo: (title: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  updateTodo: (id: string, title: string) => void
}

function generateId() {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const useTodosStore = create<TodosState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (title) =>
        set((state) => ({
          todos: [
            {
              id: generateId(),
              title: title.trim(),
              done: false,
              createdAt: new Date().toISOString(),
            },
            ...state.todos,
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
      updateTodo: (id, title) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, title: title.trim() } : t
          ),
        })),
    }),
    { name: 'dashboard-todos' }
  )
)
