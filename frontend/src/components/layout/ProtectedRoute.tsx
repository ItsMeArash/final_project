'use client'

import { PageSpinner } from '@/components/ui/PageSpinner'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDictionary } from '@/contexts/DictionaryContext'

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
  const params = useParams()
  const lang = params?.lang as string
  const { t } = useDictionary()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!token || !user) {
      router.push(`/${lang}/auth/login`)
      return
    }
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push(`/${lang}/dashboard`)
    }
  }, [mounted, token, user, requiredPermission, hasPermission, router, lang])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <PageSpinner message={t('common.loading')} />
      </div>
    )
  }

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
