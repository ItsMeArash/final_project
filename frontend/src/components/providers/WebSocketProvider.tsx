'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore, type ChatMessage } from '@/stores/chatStore'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4010/ws/chat'

interface ChatWebSocketContextValue {
  sendMessage: (message: string, receiverId?: string) => void
  sendTyping: (receiverId: string) => void
  sendTypingStop: (receiverId: string) => void
}

const ChatWebSocketContext = createContext<ChatWebSocketContextValue | null>(null)

export function useChatWebSocket() {
  const ctx = useContext(ChatWebSocketContext)
  if (!ctx) {
    throw new Error('useChatWebSocket must be used within WebSocketProvider')
  }
  return ctx
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuthStore()
  const {
    addMessage,
    setOnlineUsers,
    setTypingUser,
    incrementUnreadFrom,
    selectedUserId,
  } = useChatStore()
  const pathname = usePathname()
  const wsRef = useRef<WebSocket | null>(null)
  const pathnameRef = useRef(pathname)
  const selectedUserIdRef = useRef(selectedUserId)

  pathnameRef.current = pathname
  selectedUserIdRef.current = selectedUserId

  useEffect(() => {
    if (!token) return

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?token=${token}`)

      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'chat') {
            const message: ChatMessage = {
              id: data.id || `ws-${Date.now()}`,
              sender_id: data.sender_id,
              receiver_id: data.receiver_id,
              message: data.message || data.content,
              created_at:
                data.created_at ||
                data.timestamp ||
                new Date().toISOString(),
              sender: data.sender,
            }
            const wasNew = addMessage(message)

            const isIncoming = data.receiver_id === user?.id
            if (isIncoming && wasNew) {
              const isViewing =
                pathnameRef.current?.includes('/chat') &&
                selectedUserIdRef.current === data.sender_id
              if (!isViewing) {
                incrementUnreadFrom(data.sender_id, message.id)
                const senderName =
                  data.sender?.username || data.sender?.full_name || 'Someone'
                const preview = (data.message || data.content || '').slice(0, 80)
                toast.info(
                  `${senderName}: ${preview}${preview.length >= 80 ? '...' : ''}`
                )
              }
            }
          } else if (data.type === 'online_users') {
            setOnlineUsers(data.users || [])
          } else if (data.type === 'typing' && data.sender_id && data.receiver_id === user?.id) {
            setTypingUser(data.sender_id)
            setTimeout(() => setTypingUser(null), 4000)
          } else if (data.type === 'typing_stop' && data.sender_id && data.receiver_id === user?.id) {
            setTypingUser(null)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        setTimeout(connect, 3000)
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [
    token,
    user?.id,
    addMessage,
    setOnlineUsers,
    setTypingUser,
    incrementUnreadFrom,
  ])

  const sendMessage = useCallback((message: string, receiverId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat',
          content: message,
          receiver_id: receiverId,
        })
      )
    }
  }, [])

  const sendTyping = useCallback((receiverId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'typing', receiver_id: receiverId })
      )
    }
  }, [])

  const sendTypingStop = useCallback((receiverId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'typing_stop', receiver_id: receiverId })
      )
    }
  }, [])

  const value: ChatWebSocketContextValue = {
    sendMessage,
    sendTyping,
    sendTypingStop,
  }

  return (
    <ChatWebSocketContext.Provider value={value}>
      {children}
    </ChatWebSocketContext.Provider>
  )
}
