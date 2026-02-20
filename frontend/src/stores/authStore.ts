import { create } from 'zustand'
import { User } from '@/services/auth'

interface AuthState {
  user: User | null
  token: string | null
  permissions: string[]
  setAuth: (user: User, token: string, permissions: string[]) => void
  clearAuth: () => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from localStorage if available
  let initialState: Partial<AuthState> = {}
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        initialState = { user, token }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }

  return {
    user: initialState.user || null,
    token: initialState.token || null,
    permissions: initialState.permissions || [],
    setAuth: (user, token, permissions) => {
      set({ user, token, permissions })
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    clearAuth: () => {
      set({ user: null, token: null, permissions: [] })
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
    hasPermission: (permission) => {
      const { permissions } = get()
      return permissions.includes(permission)
    },
  }
})
