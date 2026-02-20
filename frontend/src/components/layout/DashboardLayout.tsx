'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ProtectedRoute } from './ProtectedRoute'
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { useDictionary } from '@/contexts/DictionaryContext'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredPermission?: string
}

function DashboardContent({
  sidebarExpanded,
  setSidebarExpanded,
  children,
}: {
  sidebarExpanded: boolean
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}) {
  const { isPending } = useNavigation() ?? {}
  const { t } = useDictionary()
  const prevIsPending = useRef(isPending)

  useEffect(() => {
    if (prevIsPending.current && !isPending) {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches
      if (isMobile) setSidebarExpanded(false)
    }
    prevIsPending.current = isPending
  }, [isPending, setSidebarExpanded])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar
        onToggleSidebar={() => setSidebarExpanded((p) => !p)}
        isSidebarExpanded={sidebarExpanded}
      />
      {sidebarExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarExpanded(false)}
          aria-hidden
        />
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar isExpanded={sidebarExpanded} />
        <main className="relative min-h-0 flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out sm:p-6 lg:p-8">
          {isPending && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/80 backdrop-blur-[1px] dark:bg-gray-900/80"
              aria-live="polite"
            >
              <PageSpinner message={t('common.loading')} fullScreen={false} />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

export function DashboardLayout({
  children,
  requiredPermission,
}: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    setSidebarExpanded(isDesktop)
  }, [])

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <NavigationProvider>
        <DashboardContent
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        >
          {children}
        </DashboardContent>
      </NavigationProvider>
    </ProtectedRoute>
  )
}
