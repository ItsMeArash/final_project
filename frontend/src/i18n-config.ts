export const i18n = {
  defaultLocale: 'fa',
  locales: ['en', 'fa'],
} as const

export type Locale = (typeof i18n)['locales'][number]

export const hasLocale = (locale: string): locale is Locale =>
  i18n.locales.includes(locale as Locale)
