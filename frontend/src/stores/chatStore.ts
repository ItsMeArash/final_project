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
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setOnlineUsers: (users: OnlineUser[]) => void
  setSelectedUser: (userId: string | null) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineUsers: [],
  selectedUserId: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setSelectedUser: (userId) => set({ selectedUserId: userId }),
  clearChat: () => set({ messages: [], selectedUserId: null }),
}))
