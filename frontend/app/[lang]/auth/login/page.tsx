'use client'

import { useState } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

type LoginStep = 'credentials' | 'captcha'

function setNextLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
}

export default function LoginPage() {
  const { t } = useDictionary()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = params?.lang as string
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
      try {
        const token = data.token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api'}/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (response.ok) {
          const meData = await response.json()
          const permissions = meData.permissions || []
          setAuth(data.user, data.token, permissions)
        } else {
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
        router.push(`/${lang}/dashboard`)
      } catch (error) {
        console.error('Error fetching user permissions:', error)
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
        router.push(`/${lang}/dashboard`)
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

  const switchLocale = (newLocale: string) => {
    setNextLocaleCookie(newLocale)
    const pathWithoutLocale = pathname?.replace(/^\/(en|fa)/, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale || ''}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 sm:px-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="relative">
          <div className="absolute top-0 right-0 flex gap-1">
            <button
              type="button"
              onClick={() => switchLocale('fa')}
              className={`rounded px-2 py-1 text-sm ${
                lang === 'fa' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              FA
            </button>
            <button
              type="button"
              onClick={() => switchLocale('en')}
              className={`rounded px-2 py-1 text-sm ${
                lang === 'en' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              EN
            </button>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('auth.loginTitle')}
          </h2>
        </div>

        {step === 'credentials' && (
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {loginMutation.isError && (
              <div className="text-sm text-red-600 dark:text-red-400">{t('auth.invalidCredentials')}</div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {loginMutation.isPending ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
        )}

        {step === 'captcha' && (
          <form className="mt-8 space-y-6" onSubmit={handleCaptchaSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {captchaQuestion}
              </label>
              <input
                type="text"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('auth.enterAnswer')}
              />
            </div>

            {verifyCaptchaMutation.isError && (
              <div className="text-sm text-red-600 dark:text-red-400">{t('auth.invalidCaptcha')}</div>
            )}

            <button
              type="submit"
              disabled={verifyCaptchaMutation.isPending}
              className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {verifyCaptchaMutation.isPending ? t('auth.verifying') : t('auth.verifyCaptcha')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
