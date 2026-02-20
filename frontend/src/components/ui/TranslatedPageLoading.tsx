'use client'

import { useDictionary } from '@/contexts/DictionaryContext'
import PageLoading from './PageLoading'

interface TranslatedPageLoadingProps {
  messageKey?: string
}

export default function TranslatedPageLoading({
  messageKey = 'loading.default',
}: TranslatedPageLoadingProps) {
  const { t } = useDictionary()
  return <PageLoading message={t(messageKey)} />
}
