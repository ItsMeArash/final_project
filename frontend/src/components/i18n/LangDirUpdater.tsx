'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { i18n } from '@/i18n-config'

export function LangDirUpdater() {
  const pathname = usePathname()

  useEffect(() => {
    const segment = pathname?.split('/')[1]
    const lang = i18n.locales.includes(segment as 'en' | 'fa')
      ? segment
      : i18n.defaultLocale
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
    }
  }, [pathname])

  return null
}
