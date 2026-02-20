'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function DirLangUpdater({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const updateDirAndLang = () => {
      if (typeof document !== 'undefined') {
        document.documentElement.dir = i18n.dir()
        document.documentElement.lang = i18n.language
      }
    }

    updateDirAndLang()
    i18n.on('languageChanged', updateDirAndLang)
    return () => i18n.off('languageChanged', updateDirAndLang)
  }, [i18n])

  return <>{children}</>
}
