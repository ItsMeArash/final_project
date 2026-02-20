'use client'

import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ProtectedRoute } from './ProtectedRoute'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredPermission?: string
}

export function DashboardLayout({
  children,
  requiredPermission,
}: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          onToggleSidebar={() => setSidebarExpanded((p) => !p)}
          isSidebarExpanded={sidebarExpanded}
        />
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar isExpanded={sidebarExpanded} />
          <main className="flex-1 p-8 transition-all duration-300 ease-in-out">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
