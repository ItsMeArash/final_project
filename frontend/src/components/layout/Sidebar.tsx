'use client'

import { useAuthStore } from '@/stores/authStore'
import { usePathname } from 'next/navigation'
import { LocaleLink } from '@/components/LocaleLink'
import { useDictionary } from '@/contexts/DictionaryContext'
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  MessageCircle,
} from 'lucide-react'

interface SidebarProps {
  isExpanded: boolean
  onToggle?: () => void
}

const menuItems = [
  { labelKey: 'layout.dashboard', href: '/dashboard', permission: null, Icon: LayoutDashboard },
  { labelKey: 'layout.users', href: '/users', permission: 'USER_READ', Icon: Users },
  { labelKey: 'layout.roles', href: '/roles', permission: 'ROLE_MANAGE', Icon: Shield },
  { labelKey: 'layout.analytics', href: '/analytics', permission: 'ANALYTICS_VIEW', Icon: BarChart3 },
  { labelKey: 'layout.chat', href: '/chat', permission: 'CHAT_SEND', Icon: MessageCircle },
] as const

export function Sidebar({ isExpanded }: SidebarProps) {
  const { hasPermission } = useAuthStore()
  const pathname = usePathname()
  const { t } = useDictionary()

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside
      className={`m-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-[72px]'
      }`}
    >
      <nav className="py-4">
        <div className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const pathWithoutLocale = pathname?.replace(/^\/(en|fa)/, '') || '/'
            const isActive =
              pathWithoutLocale === item.href ||
              pathWithoutLocale.startsWith(`${item.href}/`)
            const Icon = item.Icon
            return (
              <LocaleLink
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${!isExpanded ? 'justify-center' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className="truncate">{t(item.labelKey)}</span>
                )}
              </LocaleLink>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
