'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { chatService } from '@/services/chat'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import { format } from 'date-fns'

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
  } = useChatStore()
  const { sendMessage: wsSendMessage } = useWebSocket()
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    wsSendMessage(messageInput, selectedUserId)
    setMessageInput('')
  }

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender_id === user?.id && msg.receiver_id === selectedUserId) ||
      (msg.sender_id === selectedUserId && msg.receiver_id === user?.id)
  )

  return (
    <DashboardLayout requiredPermission="CHAT_SEND">
      <div className="flex h-[calc(100vh-200px)]">
        <div className="w-64 bg-white shadow rounded-lg p-4 mr-4">
          <h2 className="text-lg font-semibold mb-4">{t('chat.onlineUsers')}</h2>
          <div className="space-y-2">
            {onlineUsers
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    selectedUserId === u.id
                      ? 'bg-primary-100 text-primary-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {u.username}
                </button>
              ))}
          </div>
        </div>

        <div className="flex-1 bg-white shadow rounded-lg flex flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  {onlineUsers.find((u) => u.id === selectedUserId)?.username}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    onChange={(e) => setMessageInput(e.target.value)}
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
