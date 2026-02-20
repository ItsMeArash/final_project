'use client'

import { useDictionary } from '@/contexts/DictionaryContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function DashboardPage() {
  const { t } = useDictionary()

  return (
    <DashboardLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.welcomeBack')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dashboard.sidebarHint')}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.quickActions')}
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• {t('dashboard.manageUsers')}</li>
              <li>• {t('dashboard.viewAnalytics')}</li>
              <li>• {t('dashboard.chatWithTeam')}</li>
            </ul>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.systemStatus')}
            </h3>
            <p className="font-medium text-green-600 dark:text-green-400">{t('dashboard.allSystemsOperational')}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
