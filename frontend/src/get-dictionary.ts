import 'server-only'
import type { Locale } from '@/i18n-config'

const dictionaries = {
  en: () =>
    import('../dictionaries/en.json').then((m) => (m as { default?: unknown }).default ?? m),
  fa: () =>
    import('../dictionaries/fa.json').then((m) => (m as { default?: unknown }).default ?? m),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['en']>>

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]?.() ?? dictionaries.en()
