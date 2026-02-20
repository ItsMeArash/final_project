'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore, ChatMessage } from '@/stores/chatStore'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4010/ws/chat'

export function useWebSocket() {
  const { token } = useAuthStore()
  const { addMessage, setOnlineUsers } = useChatStore()
  const wsRef = useRef<WebSocket | null>(null)

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
              created_at: data.created_at || data.timestamp || new Date().toISOString(),
              sender: data.sender,
            }
            addMessage(message)
          } else if (data.type === 'online_users') {
            setOnlineUsers(data.users || [])
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
  }, [token, addMessage, setOnlineUsers])

  const sendMessage = (message: string, receiverId?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat',
          content: message,
          receiver_id: receiverId,
        })
      )
    }
  }

  return { sendMessage }
}
