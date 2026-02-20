import api from './api'

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
  receiver?: {
    id: string
    username: string
    full_name: string
  }
}

export const chatService = {
  getChatHistory: async (userId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chat/history/${userId}`)
    return response.data
  },
}
