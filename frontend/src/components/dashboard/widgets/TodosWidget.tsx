'use client'

import { useState, useRef, useEffect } from 'react'
import { useDictionary } from '@/contexts/DictionaryContext'
import { useTodosStore } from '@/stores/todosStore'
import { WidgetCard } from './WidgetCard'
import { Plus, Trash2, Check } from 'lucide-react'

export function TodosWidget() {
  const { t } = useDictionary()
  const { todos, addTodo, toggleTodo, removeTodo, updateTodo } = useTodosStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed) {
      addTodo(trimmed)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const activeTodos = todos.filter((t) => !t.done)
  const doneTodos = todos.filter((t) => t.done)

  return (
    <WidgetCard title={t('dashboard.widgets.todos')}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('dashboard.addTodo')}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            onClick={handleAdd}
            className="flex shrink-0 items-center justify-center rounded-lg bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700"
            aria-label={t('dashboard.addTodo')}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {activeTodos.slice(0, 5).map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onRemove={() => removeTodo(todo.id)}
              onUpdate={(title) => updateTodo(todo.id, title)}
            />
          ))}
          {doneTodos.slice(0, 2).map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onRemove={() => removeTodo(todo.id)}
              onUpdate={(title) => updateTodo(todo.id, title)}
              done
            />
          ))}
          {todos.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.noTodos')}
            </p>
          )}
        </div>
      </div>
    </WidgetCard>
  )
}

function TodoItem({
  todo,
  onToggle,
  onRemove,
  onUpdate,
  done,
}: {
  todo: { id: string; title: string; done: boolean }
  onToggle: () => void
  onRemove: () => void
  onUpdate: (title: string) => void
  done?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleBlur = () => {
    setEditing(false)
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== todo.title) onUpdate(trimmed)
    else setEditValue(todo.title)
  }

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
        done
          ? 'bg-gray-50 dark:bg-gray-700/50'
          : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          done
            ? 'border-primary-600 bg-primary-600 text-white'
            : 'border-gray-400 hover:border-primary-500 dark:border-gray-500'
        }`}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done && <Check className="h-3 w-3" />}
      </button>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="flex-1 bg-transparent text-sm focus:outline-none dark:text-gray-100"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`min-w-0 flex-1 truncate text-left text-sm ${
            done ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'
          }`}
        >
          {todo.title}
        </button>
      )}
      <button
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
