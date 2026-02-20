'use client'

import {
  createContext,
  useContext,
  useTransition,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

interface NavigationContextValue {
  isPending: boolean
  navigate: (href: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href)
      })
    },
    [router]
  )

  return (
    <NavigationContext.Provider value={{ isPending, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  return context
}
