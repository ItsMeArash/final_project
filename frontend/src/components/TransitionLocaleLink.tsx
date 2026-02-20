'use client'

import Link from 'next/link'
import { useLocaleHref } from '@/hooks/useLocaleHref'
import { useNavigation } from '@/contexts/NavigationContext'
import type { ComponentProps } from 'react'

interface TransitionLocaleLinkProps
  extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string
}

/**
 * Link that shows loading state immediately on click via useTransition.
 * Use for sidebar/nav items where instant feedback matters.
 */
export function TransitionLocaleLink({
  href,
  onClick,
  ...props
}: TransitionLocaleLinkProps) {
  const resolvedHref = useLocaleHref(href)
  const navigation = useNavigation()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (navigation?.navigate) {
      e.preventDefault()
      navigation.navigate(resolvedHref)
    }
  }

  if (navigation?.navigate) {
    return (
      <Link
        href={resolvedHref}
        onClick={handleClick}
        {...props}
      >
        {props.children}
      </Link>
    )
  }

  return <Link href={resolvedHref} {...props} />
}
