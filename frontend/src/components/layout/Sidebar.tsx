'use client'

import { useAuthStore } from '@/stores/authStore'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function Sidebar() {
  const { hasPermission } = useAuthStore()
  const pathname = usePathname()
  const { t } = useTranslation()

  const menuItems = [
    { labelKey: 'layout.dashboard', href: '/dashboard', permission: null },
    { labelKey: 'layout.users', href: '/users', permission: 'USER_READ' },
    { labelKey: 'layout.analytics', href: '/analytics', permission: 'ANALYTICS_VIEW' },
    { labelKey: 'layout.chat', href: '/chat', permission: 'CHAT_SEND' },
  ]

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
