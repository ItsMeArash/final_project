import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from '@/i18n-config'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && i18n.locales.includes(cookieLocale as 'en' | 'fa')) {
    return cookieLocale
  }

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    i18n.locales as unknown as string[]
  )
  const locale = matchLocale(languages, i18n.locales as unknown as string[], i18n.defaultLocale)
  return locale ?? i18n.defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1] as string
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-next-locale', locale)
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  const locale = getLocale(request)
  const newUrl = new URL(
    `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
    request.url
  )
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
