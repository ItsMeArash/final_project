'use client'

import { useAuthStore } from '@/stores/authStore'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { useDictionary } from '@/contexts/DictionaryContext'
import { Menu, LogOut } from 'lucide-react'

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarExpanded: boolean
}

function setNextLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
}

export function Navbar({ onToggleSidebar, isSidebarExpanded }: NavbarProps) {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = params?.lang as string
  const { t } = useDictionary()

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
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
              aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('layout.adminDashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button
                onClick={() => switchLocale('fa')}
                className={`px-2 py-1 text-sm rounded ${
                  lang === 'fa'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FA
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-2 py-1 text-sm rounded ${
                  lang === 'en'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                EN
              </button>
            </div>
            <span className="text-sm text-gray-700">
              {user?.full_name} ({user?.role?.name})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t('layout.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
