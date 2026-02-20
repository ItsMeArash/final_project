'use client'

import { useAuthStore } from '@/stores/authStore'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useDictionary } from '@/contexts/DictionaryContext'
import { Menu, LogOut, Sun, Moon } from 'lucide-react'

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarExpanded: boolean
}

function setNextLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
}

export function Navbar({ onToggleSidebar, isSidebarExpanded }: NavbarProps) {
  const { user, clearAuth } = useAuthStore()
  const { setTheme, resolvedTheme } = useTheme()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = params?.lang as string
  const { t } = useDictionary()
  const isDark = resolvedTheme === 'dark'

  const handleLogout = () => {
    clearAuth()
    router.push(`/${lang}/auth/login`)
  }

  const switchLocale = (newLocale: string) => {
    setNextLocaleCookie(newLocale)
    const pathWithoutLocale = pathname?.replace(/^\/(en|fa)/, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale || ''}`)
  }

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
              {t('layout.adminDashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label={isDark ? t('layout.themeLight') : t('layout.themeDark')}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => switchLocale('fa')}
                className={`px-2 py-1 text-sm rounded ${
                  lang === 'fa'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                FA
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-2 py-1 text-sm rounded ${
                  lang === 'en'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                EN
              </button>
            </div>
            <span className="hidden text-sm text-gray-700 sm:inline dark:text-gray-300">
              {user?.full_name} ({user?.role?.name})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:px-4 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('layout.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
