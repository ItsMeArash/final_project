'use client'

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
  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
