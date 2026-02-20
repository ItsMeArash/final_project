'use client'

import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { usePathname } from 'next/navigation'
import { TransitionLocaleLink } from '@/components/TransitionLocaleLink'
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
  onClose?: () => void
}

const menuItems = [
  { labelKey: 'layout.dashboard', href: '/dashboard', permission: null, Icon: LayoutDashboard },
  { labelKey: 'layout.users', href: '/users', permission: 'USER_READ', Icon: Users },
  { labelKey: 'layout.roles', href: '/roles', permission: 'ROLE_MANAGE', Icon: Shield },
  { labelKey: 'layout.analytics', href: '/analytics', permission: 'ANALYTICS_VIEW', Icon: BarChart3 },
  { labelKey: 'layout.chat', href: '/chat', permission: 'CHAT_SEND', Icon: MessageCircle, showUnread: true },
] as const

export function Sidebar({ isExpanded, onClose }: SidebarProps) {
  const { hasPermission } = useAuthStore()
  const { unreadByUserId } = useChatStore()
  const unreadCount = Object.values(unreadByUserId).reduce((a, b) => a + b, 0)
  const pathname = usePathname()
  const { t } = useDictionary()

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside
      className={`shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800
        lg:m-4
        ${isExpanded ? 'w-64' : 'w-[72px]'}
        max-lg:fixed max-lg:inset-y-0 max-lg:z-50 max-lg:m-0 max-lg:w-64 max-lg:rounded-none max-lg:border-0
        max-lg:transition-transform max-lg:duration-300
        ${!isExpanded ? 'max-lg:-translate-x-full max-lg:rtl:translate-x-full' : 'max-lg:translate-x-0'}
        max-lg:start-0
      `}
    >
      <nav className="py-4">
        <div className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const pathWithoutLocale = pathname?.replace(/^\/(en|fa)/, '') || '/'
            const isActive =
              pathWithoutLocale === item.href ||
              pathWithoutLocale.startsWith(`${item.href}/`)
            const Icon = item.Icon
            const showBadge =
              'showUnread' in item && item.showUnread && unreadCount > 0
            return (
              <TransitionLocaleLink
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${!isExpanded ? 'justify-center' : ''}`}
              >
                <span className="relative shrink-0">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span
                      className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                {isExpanded && (
                  <span className="truncate flex-1">{t(item.labelKey)}</span>
                )}
              </TransitionLocaleLink>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
