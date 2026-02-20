'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ComponentProps } from 'react'

export function LocaleLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const params = useParams()
  const lang = params?.lang as string | undefined
  const hrefStr = href.toString()
  const hasLocale = hrefStr.match(/^\/(en|fa)(\/|$)/)
  const resolvedHref =
    lang && hrefStr.startsWith('/') && !hasLocale
      ? `/${lang}${hrefStr === '/' ? '' : hrefStr}`
      : href
  return <Link href={resolvedHref} {...props} />
}
