import { create } from 'zustand'

export interface OnlineUser {
  id: string
  username: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id?: string
  message: string
  created_at: string
  sender?: {
    id: string
    username: string
    full_name: string
  }
}

interface ChatState {
  messages: ChatMessage[]
  onlineUsers: OnlineUser[]
  selectedUserId: string | null
  typingUserId: string | null
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setOnlineUsers: (users: OnlineUser[]) => void
  setSelectedUser: (userId: string | null) => void
  setTypingUser: (userId: string | null) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineUsers: [],
  selectedUserId: null,
  typingUserId: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id)
      if (exists) return state
      return { messages: [...state.messages, message] }
    }),
  setOnlineUsers: (users) => {
    const seen = new Set<string>()
    const unique = users.filter((u) => {
      if (seen.has(u.id)) return false
      seen.add(u.id)
      return true
    })
    set({ onlineUsers: unique })
  },
  setSelectedUser: (userId) => set({ selectedUserId: userId }),
  setTypingUser: (userId) => set({ typingUserId: userId }),
  clearChat: () => set({ messages: [], selectedUserId: null, typingUserId: null }),
}))
