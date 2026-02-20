'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

type LoginStep = 'credentials' | 'captcha'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const { setAuth } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.requires_captcha && data.captcha_id) {
        setCaptchaId(data.captcha_id)
        setCaptchaQuestion(data.captcha_question || '')
        setStep('captcha')
      }
    },
  })

  const verifyCaptchaMutation = useMutation({
    mutationFn: authService.verifyCaptcha,
    onSuccess: async (data) => {
      // Fetch user permissions from backend
      try {
        const token = data.token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
        
        // Fetch current user with permissions
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api'}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const meData = await response.json()
          const permissions = meData.permissions || []
          setAuth(data.user, data.token, permissions)
        } else {
          // Fallback to role-based permissions if API fails
          const permissions =
            data.user.role?.name === 'admin'
              ? [
                  'USER_CREATE',
                  'USER_READ',
                  'USER_UPDATE',
                  'USER_DELETE',
                  'ROLE_MANAGE',
                  'ANALYTICS_VIEW',
                  'CHAT_SEND',
                ]
              : data.user.role?.name === 'manager'
              ? ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'ANALYTICS_VIEW', 'CHAT_SEND']
              : ['USER_READ', 'ANALYTICS_VIEW', 'CHAT_SEND']
          setAuth(data.user, data.token, permissions)
        }
        
        router.push('/dashboard')
      } catch (error) {
        console.error('Error fetching user permissions:', error)
        // Still proceed with login using fallback permissions
        const permissions =
          data.user.role?.name === 'admin'
            ? [
                'USER_CREATE',
                'USER_READ',
                'USER_UPDATE',
                'USER_DELETE',
                'ROLE_MANAGE',
                'ANALYTICS_VIEW',
                'CHAT_SEND',
              ]
            : data.user.role?.name === 'manager'
            ? ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'ANALYTICS_VIEW', 'CHAT_SEND']
            : ['USER_READ', 'ANALYTICS_VIEW', 'CHAT_SEND']
        setAuth(data.user, data.token, permissions)
        router.push('/dashboard')
      }
    },
  })

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  const handleCaptchaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyCaptchaMutation.mutate({ username, captcha_id: captchaId, answer: captchaAnswer })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="relative">
          <div className="absolute top-0 right-0 flex gap-1">
            <button
              type="button"
              onClick={() => i18n.changeLanguage('fa')}
              className={`px-2 py-1 text-sm rounded ${
                i18n.language === 'fa' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              FA
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage('en')}
              className={`px-2 py-1 text-sm rounded ${
                i18n.language === 'en' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              EN
            </button>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.loginTitle')}
          </h2>
        </div>

        {step === 'credentials' && (
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {t('auth.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {loginMutation.isError && (
              <div className="text-red-600 text-sm">
                {t('auth.invalidCredentials')}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loginMutation.isPending ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
        )}

        {step === 'captcha' && (
          <form className="mt-8 space-y-6" onSubmit={handleCaptchaSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {captchaQuestion}
              </label>
              <input
                type="text"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('auth.enterAnswer')}
              />
            </div>

            {verifyCaptchaMutation.isError && (
              <div className="text-red-600 text-sm">
                {t('auth.invalidCaptcha')}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyCaptchaMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {verifyCaptchaMutation.isPending ? t('auth.verifying') : t('auth.verifyCaptcha')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
