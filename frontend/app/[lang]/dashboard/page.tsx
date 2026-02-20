'use client'

import { useDictionary } from '@/contexts/DictionaryContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function DashboardPage() {
  const { t } = useDictionary()

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('dashboard.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('dashboard.welcomeBack')}
            </h3>
            <p className="text-gray-600">
              {t('dashboard.sidebarHint')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('dashboard.quickActions')}
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• {t('dashboard.manageUsers')}</li>
              <li>• {t('dashboard.viewAnalytics')}</li>
              <li>• {t('dashboard.chatWithTeam')}</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('dashboard.systemStatus')}
            </h3>
            <p className="text-green-600 font-medium">{t('dashboard.allSystemsOperational')}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
