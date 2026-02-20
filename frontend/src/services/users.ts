import api from './api'
import { User } from './auth'

export interface CreateUserRequest {
  full_name: string
  username: string
  password: string
  role_id: string
  is_active?: boolean
}

export interface UpdateUserRequest {
  full_name?: string
  username?: string
  password?: string
  role_id?: string
  is_active?: boolean
}

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data)
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
