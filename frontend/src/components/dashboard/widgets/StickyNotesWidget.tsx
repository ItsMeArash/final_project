'use client'

import { useDictionary } from '@/contexts/DictionaryContext'
import { useStickyNotesStore, type NoteColor } from '@/stores/stickyNotesStore'
import { WidgetCard } from './WidgetCard'
import { Plus, X } from 'lucide-react'

const NOTE_COLORS: Record<NoteColor, string> = {
  yellow: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
  pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
  blue: 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700',
  green: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
}

export function StickyNotesWidget() {
  const { t } = useDictionary()
  const { notes, addNote, updateNote, removeNote } = useStickyNotesStore()

  return (
    <WidgetCard
      title={t('dashboard.widgets.stickyNotes')}
      actions={
        <button
          onClick={() => addNote()}
          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400"
          aria-label={t('dashboard.addNote')}
        >
          <Plus className="h-4 w-4" />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        {notes.slice(0, 6).map((note, i) => (
          <div
            key={note.id}
            className={`group relative min-h-[80px] rounded-lg border p-3 shadow-sm transition-transform hover:shadow-md ${NOTE_COLORS[note.color]}`}
            style={{
              transform: `rotate(${[-1, 0, 1, -0.5, 0.5][i % 5]}deg)`,
            }}
          >
            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
              placeholder={t('dashboard.addNote')}
              className="h-full min-h-[60px] w-full resize-none border-0 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 dark:text-gray-200 dark:placeholder-gray-400"
              rows={3}
            />
            <button
              onClick={() => removeNote(note.id)}
              className="absolute -right-1 -top-1 rounded-full bg-gray-800/80 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 dark:bg-gray-200/80 dark:text-gray-800"
              aria-label="Delete note"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="col-span-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.noNotes')}
          </p>
        )}
      </div>
    </WidgetCard>
  )
}
