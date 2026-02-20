'use client'

import { useDictionary } from '@/contexts/DictionaryContext'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { WidgetCard } from './WidgetCard'
import { ChatPopup } from '../ChatPopup'
import { useState } from 'react'
import { format } from 'date-fns'
import type { ChatMessage } from '@/stores/chatStore'

export function ChatGlanceWidget() {
  const { t } = useDictionary()
  const { user } = useAuthStore()
  const { messages, unreadByUserId, onlineUsers, setSelectedUser } =
    useChatStore()
  const [popupOpen, setPopupOpen] = useState(false)
  const [initialUserId, setInitialUserId] = useState<string | null>(null)

  const unreadCount = Object.values(unreadByUserId).reduce((a, b) => a + b, 0)

  const recentMessages = [...messages]
    .filter(
      (m) =>
        m.sender_id === user?.id || m.receiver_id === user?.id
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)

  const getSenderName = (msg: ChatMessage) => {
    if (msg.sender_id === user?.id) return t('dashboard.you')
    const sender = onlineUsers.find((u) => u.id === msg.sender_id)
    return sender?.username ?? msg.sender?.username ?? msg.sender?.full_name ?? '—'
  }

  const getOtherUserId = (msg: ChatMessage) =>
    msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id

  const handleOpenChat = (userId?: string | null) => {
    if (userId) {
      setSelectedUser(userId)
      setInitialUserId(userId)
    } else {
      setInitialUserId(null)
    }
    setPopupOpen(true)
  }

  return (
    <>
      <WidgetCard
        title={t('dashboard.widgets.chatGlance')}
        actions={
          <button
            onClick={() => handleOpenChat()}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
          >
            {t('dashboard.openChat')}
          </button>
        }
      >
        <div className="space-y-2">
          {unreadCount > 0 && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {unreadCount} {t('dashboard.unreadMessages')}
            </p>
          )}
          {recentMessages.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.noMessages')}
            </p>
          ) : (
            recentMessages.map((msg) => {
              const otherId = getOtherUserId(msg)
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => otherId && handleOpenChat(otherId)}
                  className="w-full rounded-lg bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                >
                  <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                    {getSenderName(msg)}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                    {msg.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </WidgetCard>
      <ChatPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        initialUserId={initialUserId}
      />
    </>
  )
}
