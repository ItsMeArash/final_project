import api from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface CaptchaResponse {
  id: string
  question: string
}

export interface LoginResponse {
  message: string
  requires_captcha: boolean
  captcha_id?: string
  captcha_question?: string
}

export interface VerifyCaptchaRequest {
  username: string
  captcha_id: string
  answer: string
}

export interface User {
  id: string
  full_name: string
  username: string
  is_active: boolean
  role_id: string
  role?: {
    id: string
    name: string
    description: string
  }
  created_at: string
}

export interface VerifyCaptchaResponse {
  token: string
  user: User
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  getCaptcha: async (): Promise<CaptchaResponse> => {
    const response = await api.get('/auth/captcha')
    return response.data
  },

  verifyCaptcha: async (data: VerifyCaptchaRequest): Promise<VerifyCaptchaResponse> => {
    const response = await api.post('/auth/verify-captcha', data)
    return response.data
  },
}
