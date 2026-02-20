'use client'

import { useTranslation } from 'react-i18next'
import PageLoading from './PageLoading'

interface TranslatedPageLoadingProps {
  messageKey?: string
}

export default function TranslatedPageLoading({
  messageKey = 'loading.default',
}: TranslatedPageLoadingProps) {
  const { t } = useTranslation()
  return <PageLoading message={t(messageKey)} />
}
