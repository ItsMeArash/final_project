'use client'

import dynamic from 'next/dynamic'
import { useDictionary } from '@/contexts/DictionaryContext'
import { useAuthStore } from '@/stores/authStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ChatGlanceWidget } from '@/components/dashboard/widgets/ChatGlanceWidget'
import { WeatherWidget } from '@/components/dashboard/widgets/WeatherWidget'
import { TodosWidget } from '@/components/dashboard/widgets/TodosWidget'
import { StickyNotesWidget } from '@/components/dashboard/widgets/StickyNotesWidget'

const DashboardGridClient = dynamic(
  () =>
    import('@/components/dashboard/DashboardGrid').then((m) => ({
      default: m.DashboardGrid,
    })),
  { ssr: false }
)

export default function DashboardPage() {
  const { t } = useDictionary()
  const { hasPermission } = useAuthStore()

  const visibleWidgets = [
    ...(hasPermission('CHAT_SEND') ? ['chat' as const] : []),
    'weather',
    'todos',
    'notes',
  ]

  const widgetComponents: Record<string, React.ReactNode> = {
    chat: <ChatGlanceWidget />,
    weather: <WeatherWidget />,
    todos: <TodosWidget />,
    notes: <StickyNotesWidget />,
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          {t('dashboard.title')}
        </h1>
        <DashboardGridClient
          visibleWidgets={visibleWidgets}
          children={widgetComponents}
        />
      </div>
    </DashboardLayout>
  )
}
