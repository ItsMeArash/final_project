'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useDictionary } from '@/contexts/DictionaryContext'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useChatWebSocket } from '@/components/providers/WebSocketProvider'
import { useLocaleHref } from '@/hooks/useLocaleHref'
import { format } from 'date-fns'
import { UserCircle, X } from 'lucide-react'

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
  initialUserId?: string | null
}

export function ChatPopup({ isOpen, onClose, initialUserId }: ChatPopupProps) {
  const { t } = useDictionary()
  const { user } = useAuthStore()
  const chatHref = useLocaleHref('/chat')
  const {
    selectedUserId,
    setSelectedUser,
    onlineUsers,
    messages,
    typingUserId,
    unreadByUserId,
    firstUnreadMessageIdByUserId,
    clearUnreadCountFor,
    clearFirstUnreadFor,
  } = useChatStore()
  const { sendMessage: wsSendMessage, sendTyping, sendTypingStop } =
    useChatWebSocket()
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasSentTypingRef = useRef(false)

  useEffect(() => {
    if (isOpen && initialUserId) {
      setSelectedUser(initialUserId)
    }
  }, [isOpen, initialUserId, setSelectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const prevSelectedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (selectedUserId) clearUnreadCountFor(selectedUserId)
    const prev = prevSelectedUserIdRef.current
    if (prev && prev !== selectedUserId) clearFirstUnreadFor(prev)
    prevSelectedUserIdRef.current = selectedUserId
  }, [selectedUserId, clearUnreadCountFor, clearFirstUnreadFor])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedUserId) return

    sendTypingStop(selectedUserId)
    hasSentTypingRef.current = false
    wsSendMessage(messageInput, selectedUserId)
    setMessageInput('')
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setMessageInput(value)
      if (!selectedUserId) return

      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current)
      }
      if (!hasSentTypingRef.current) {
        hasSentTypingRef.current = true
        sendTyping(selectedUserId)
      }
      typingStopTimeoutRef.current = setTimeout(() => {
        sendTypingStop(selectedUserId)
        hasSentTypingRef.current = false
        typingStopTimeoutRef.current = null
      }, 2000)
    },
    [selectedUserId, sendTyping, sendTypingStop]
  )

  useEffect(() => {
    return () => {
      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!selectedUserId) return
    return () => {
      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current)
        typingStopTimeoutRef.current = null
      }
      sendTypingStop(selectedUserId)
      hasSentTypingRef.current = false
    }
  }, [selectedUserId, sendTypingStop])

  const allConversationMessages = messages
    .filter(
      (msg) =>
        (msg.sender_id === user?.id && msg.receiver_id === selectedUserId) ||
        (msg.sender_id === selectedUserId && msg.receiver_id === user?.id)
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  const firstUnreadId =
    selectedUserId && firstUnreadMessageIdByUserId[selectedUserId]
  const unreadStartIndex = firstUnreadId
    ? allConversationMessages.findIndex((m) => m.id === firstUnreadId)
    : -1
  const filteredMessages =
    unreadStartIndex >= 0
      ? allConversationMessages.slice(unreadStartIndex)
      : []

  const otherOnlineUsers = onlineUsers.filter((u) => u.id !== user?.id)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-800">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('layout.chat')}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <div className="flex w-full shrink-0 flex-col border-b border-gray-200 sm:w-48 sm:border-b-0 sm:border-e dark:border-gray-700">
            <h3 className="border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300">
              {t('chat.onlineUsers')}
            </h3>
            <div className="max-h-32 overflow-y-auto sm:max-h-none sm:flex-1">
              {otherOnlineUsers.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  {t('chat.noOnlineUsers')}
                </p>
              ) : (
                otherOnlineUsers.map((u) => {
                  const unread = unreadByUserId[u.id] ?? 0
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                        selectedUserId === u.id
                          ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <UserCircle className="h-6 w-6 shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1 truncate">{u.username}</span>
                      {unread > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {selectedUserId ? (
              <>
                <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                  <UserCircle className="h-8 w-8 shrink-0 text-gray-400" />
                  <span className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {onlineUsers.find((u) => u.id === selectedUserId)?.username}
                  </span>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                  {typingUserId === selectedUserId && (
                    <p className="text-xs italic text-gray-500">
                      {onlineUsers.find((u) => u.id === typingUserId)?.username}{' '}
                      {t('chat.isTyping')}
                    </p>
                  )}
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('dashboard.noNewMessages')}
                      </p>
                      <Link
                        href={chatHref}
                        onClick={onClose}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {t('dashboard.viewFullConversation')}
                      </Link>
                    </div>
                  ) : (
                    <>
                      {filteredMessages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id
                        const showUnreadDivider =
                          firstUnreadId && msg.id === firstUnreadId
                        return (
                          <div key={msg.id}>
                            {showUnreadDivider && (
                              <div className="flex items-center gap-2 py-1">
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
                                <span className="text-xs text-gray-500">
                                  {t('chat.newMessages')}
                                </span>
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
                              </div>
                            )}
                            <div
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                  isOwn
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100'
                                }`}
                              >
                                <p>{msg.message}</p>
                                <p
                                  className={`mt-0.5 text-xs ${
                                    isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  {format(new Date(msg.created_at), 'HH:mm')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div className="mt-4 text-center">
                        <Link
                          href={chatHref}
                          onClick={onClose}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          {t('dashboard.viewFullConversation')}
                        </Link>
                      </div>
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleInputChange}
                      placeholder={t('chat.typeMessage')}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      {t('chat.send')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-500 dark:text-gray-400">
                {t('chat.selectUserToChat')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
