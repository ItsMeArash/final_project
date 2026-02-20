'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { chatService } from '@/services/chat'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'
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
    addMessage,
    typingUserId,
  } = useChatStore()
  const { sendMessage: wsSendMessage, sendTyping, sendTypingStop } = useWebSocket()
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
      <div className="flex h-[calc(100vh-200px)]">
        <div className="w-64 bg-white shadow rounded-lg p-4 mr-4">
          <h2 className="text-lg font-semibold mb-4">{t('chat.onlineUsers')}</h2>
          <div className="space-y-2">
            {otherOnlineUsers.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">{t('chat.noOnlineUsers')}</p>
            ) : (
              otherOnlineUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    selectedUserId === u.id
                      ? 'bg-primary-100 text-primary-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="relative shrink-0">
                    <UserCircle className="h-9 w-9 text-gray-400" />
                    <span
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"
                      aria-hidden
                    />
                  </span>
                  <span className="truncate">{u.username}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-white shadow rounded-lg flex flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <span className="relative shrink-0">
                  <UserCircle className="h-10 w-10 text-gray-400" />
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
                    aria-hidden
                  />
                </span>
                <h2 className="text-lg font-semibold truncate">
                  {onlineUsers.find((u) => u.id === selectedUserId)?.username}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {typingUserId === selectedUserId && (
                  <div className="flex justify-start">
                    <p className="text-sm text-gray-500 italic">
                      {onlineUsers.find((u) => u.id === typingUserId)?.username}{' '}
                      {t('chat.isTyping')}
                    </p>
                  </div>
                )}
                {filteredMessages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder={t('chat.typeMessage')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {t('chat.send')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {t('chat.selectUserToChat')}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
