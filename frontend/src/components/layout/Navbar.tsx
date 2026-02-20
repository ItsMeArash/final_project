'use client'

import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const { t, i18n } = useTranslation()

  const handleLogout = () => {
    clearAuth()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {t('layout.adminDashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button
                onClick={() => i18n.changeLanguage('fa')}
                className={`px-2 py-1 text-sm rounded ${
                  i18n.language === 'fa'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FA
              </button>
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`px-2 py-1 text-sm rounded ${
                  i18n.language === 'en'
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              {t('layout.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
