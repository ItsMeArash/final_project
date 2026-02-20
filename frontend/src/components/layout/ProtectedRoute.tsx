'use client'

import { PageSpinner } from '@/components/ui/PageSpinner'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
}

export function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, token, hasPermission } = useAuthStore()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!token || !user) {
      router.push('/auth/login')
      return
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/dashboard')
    }
  }, [token, user, requiredPermission, hasPermission, router])

  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <PageSpinner message={t('common.loading')} />
      </div>
    )
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{t('common.accessDenied')}</div>
      </div>
    )
  }

  return <>{children}</>
}
