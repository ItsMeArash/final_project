'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useMutation } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'ROLE_MANAGE', 'ANALYTICS_VIEW', 'CHAT_SEND'],
  manager: ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'ANALYTICS_VIEW', 'CHAT_SEND'],
  viewer: ['USER_READ', 'ANALYTICS_VIEW', 'CHAT_SEND'],
}

function setNextLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
}

export default function RegisterPage() {
  const { t } = useDictionary()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = params?.lang as string
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const { setAuth } = useAuthStore()

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api'}/me`,
          { headers: { Authorization: `Bearer ${data.token}` } }
        )

        const permissions = response.ok
          ? (await response.json()).permissions || []
          : DEFAULT_PERMISSIONS[data.user.role?.name || 'viewer'] || DEFAULT_PERMISSIONS.viewer

        setAuth(data.user, data.token, permissions)
      } catch {
        const permissions = DEFAULT_PERMISSIONS[data.user.role?.name || 'viewer'] || DEFAULT_PERMISSIONS.viewer
        setAuth(data.user, data.token, permissions)
      }
      router.push(`/${lang}/dashboard`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({
      username,
      password,
      ...(fullName.trim() && { full_name: fullName.trim() }),
    })
  }

  const switchLocale = (newLocale: string) => {
    setNextLocaleCookie(newLocale)
    const pathWithoutLocale = pathname?.replace(/^\/(en|fa)/, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale || ''}`)
  }

  const getErrorMessage = () => {
    if (!registerMutation.isError) return null
    const err = registerMutation.error as { response?: { status?: number; data?: { error_code?: string } } }
    const status = err?.response?.status
    const data = err?.response?.data
    const errorCode = data?.error_code ?? (status === 409 ? 'USERNAME_TAKEN' : status === 400 ? 'VALIDATION' : status === 500 ? 'CREATE_FAILED' : null)
    if (errorCode) {
      const msg = t(`auth.errors.${errorCode}`)
      if (msg !== `auth.errors.${errorCode}`) return msg
    }
    return t('auth.registerError')
  }
  const errorMessage = getErrorMessage()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 sm:px-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <div className="flex gap-1">
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
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('auth.registerTitle')}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.username')} *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={50}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder={t('validation.placeholderUsername')}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('validation.usernamePattern')}</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.password')} *
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              inputClassName="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('validation.passwordHint')}</p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('users.fullName')} ({t('auth.optional')})
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              maxLength={100}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder={t('validation.placeholderFullName')}
            />
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            {registerMutation.isPending ? t('auth.registering') : t('auth.register')}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href={`/${lang}/auth/login`}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
