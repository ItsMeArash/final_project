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
  unreadByUserId: Record<string, number>
  firstUnreadMessageIdByUserId: Record<string, string>
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => boolean
  setOnlineUsers: (users: OnlineUser[]) => void
  setSelectedUser: (userId: string | null) => void
  setTypingUser: (userId: string | null) => void
  incrementUnreadFrom: (senderId: string, messageId: string) => void
  clearUnreadCountFor: (userId: string) => void
  clearFirstUnreadFor: (userId: string) => void
  clearUnread: () => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineUsers: [],
  selectedUserId: null,
  typingUserId: null,
  unreadByUserId: {},
  firstUnreadMessageIdByUserId: {},
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    let added = false
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id)
      if (exists) return state
      added = true
      return { messages: [...state.messages, message] }
    })
    return added
  },
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
  incrementUnreadFrom: (senderId, messageId) =>
    set((s) => {
      const count = (s.unreadByUserId[senderId] ?? 0) + 1
      const firstId = s.firstUnreadMessageIdByUserId[senderId] ?? messageId
      return {
        unreadByUserId: { ...s.unreadByUserId, [senderId]: count },
        firstUnreadMessageIdByUserId: {
          ...s.firstUnreadMessageIdByUserId,
          [senderId]: firstId,
        },
      }
    }),
  clearUnreadCountFor: (userId) =>
    set((s) => {
      const { [userId]: _, ...rest } = s.unreadByUserId
      return { unreadByUserId: rest }
    }),
  clearFirstUnreadFor: (userId) =>
    set((s) => {
      const { [userId]: _, ...rest } = s.firstUnreadMessageIdByUserId
      return { firstUnreadMessageIdByUserId: rest }
    }),
  clearUnread: () =>
    set({ unreadByUserId: {}, firstUnreadMessageIdByUserId: {} }),
  clearChat: () =>
    set({
      messages: [],
      selectedUserId: null,
      typingUserId: null,
      unreadByUserId: {},
      firstUnreadMessageIdByUserId: {},
    }),
}))
