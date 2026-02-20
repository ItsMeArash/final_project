'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { chatService } from '@/services/chat'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useChatWebSocket } from '@/components/providers/WebSocketProvider'
import { format } from 'date-fns'
import { UserCircle } from 'lucide-react'

export default function ChatPage() {
  const { t } = useDictionary()
  const { user } = useAuthStore()
  const {
    selectedUserId,
    setSelectedUser,
    onlineUsers,
    messages,
    setMessages,
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

  const { data: chatHistory } = useQuery({
    queryKey: ['chatHistory', selectedUserId],
    queryFn: () => chatService.getChatHistory(selectedUserId!),
    enabled: !!selectedUserId,
  })

  useEffect(() => {
    if (chatHistory) {
      const seen = new Set<string>()
      const unique = chatHistory.filter((m) => {
        if (seen.has(m.id)) return false
        seen.add(m.id)
        return true
      })
      setMessages(unique)
    }
  }, [chatHistory, setMessages])

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

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender_id === user?.id && msg.receiver_id === selectedUserId) ||
      (msg.sender_id === selectedUserId && msg.receiver_id === user?.id)
  )

  const otherOnlineUsers = onlineUsers.filter((u) => u.id !== user?.id)

  return (
    <DashboardLayout requiredPermission="CHAT_SEND">
      <div className="flex min-h-[50vh] flex-col lg:h-[calc(100vh-200px)] lg:flex-row">
        <div className="mb-4 w-full shrink-0 rounded-lg bg-white p-4 shadow lg:mr-4 lg:mb-0 lg:w-64 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('chat.onlineUsers')}</h2>
          <div className="space-y-2">
            {otherOnlineUsers.length === 0 ? (
              <p className="py-2 text-sm text-gray-500 dark:text-gray-400">{t('chat.noOnlineUsers')}</p>
            ) : (
              otherOnlineUsers.map((u) => {
                const unread = unreadByUserId[u.id] ?? 0
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${
                      selectedUserId === u.id
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="relative shrink-0">
                      <UserCircle className="h-9 w-9 text-gray-400 dark:text-gray-500" />
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
                        aria-hidden
                      />
                    </span>
                    <span className="flex-1 truncate">{u.username}</span>
                    {unread > 0 && (
                      <span
                        className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                        aria-label={`${unread} unread`}
                      >
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-lg bg-white shadow dark:bg-gray-800">
          {selectedUserId ? (
            <>
              <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
                <span className="relative shrink-0">
                  <UserCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
                    aria-hidden
                  />
                </span>
                <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {onlineUsers.find((u) => u.id === selectedUserId)?.username}
                </h2>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {typingUserId === selectedUserId && (
                  <div className="flex justify-start">
                    <p className="text-sm italic text-gray-500 dark:text-gray-400">
                      {onlineUsers.find((u) => u.id === typingUserId)?.username}{' '}
                      {t('chat.isTyping')}
                    </p>
                  </div>
                )}
                {filteredMessages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id
                  const firstUnreadId =
                    selectedUserId &&
                    firstUnreadMessageIdByUserId[selectedUserId]
                  const showUnreadDivider =
                    firstUnreadId && msg.id === firstUnreadId
                  return (
                    <div key={msg.id} className="space-y-4">
                      {showUnreadDivider && (
                        <div className="flex items-center gap-3 py-2">
                          <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('chat.newMessages')}
                          </span>
                          <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
                        </div>
                      )}
                      <div
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p
                            className={`mt-1 text-xs ${
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
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder={t('chat.typeMessage')}
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-primary-600 px-6 py-2 text-white hover:bg-primary-700"
                  >
                    {t('chat.send')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400">
              {t('chat.selectUserToChat')}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
