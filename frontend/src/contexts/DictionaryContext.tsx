'use client'

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react'
import type { Dictionary } from '@/get-dictionary'

const DictionaryContext = createContext<Dictionary | null>(null)

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary
  children: ReactNode
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  )
}

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce((o: unknown, k) => (o as Record<string, unknown>)?.[k], obj)
  return typeof value === 'string' ? value : undefined
}

export function useDictionary() {
  const dict = useContext(DictionaryContext)
  if (!dict) {
    throw new Error('useDictionary must be used within DictionaryProvider')
  }
  const t = useCallback(
    (key: string) => getNested(dict as Record<string, unknown>, key) ?? key,
    [dict]
  )
  return { dict, t }
}
