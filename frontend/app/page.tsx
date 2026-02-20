'use client'

import { PageSpinner } from '@/components/ui/PageSpinner'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <PageSpinner message={t('common.loading')} />
    </div>
  )
}
