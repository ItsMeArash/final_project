import { useParams } from 'next/navigation'

export function useLocaleHref(href: string) {
  const params = useParams()
  const lang = params?.lang as string | undefined
  const hrefStr = href.toString()
  const hasLocale = hrefStr.match(/^\/(en|fa)(\/|$)/)
  return lang && hrefStr.startsWith('/') && !hasLocale
    ? `/${lang}${hrefStr === '/' ? '' : hrefStr}`
    : href
}
