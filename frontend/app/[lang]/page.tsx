'use client'

import { PageSpinner } from '@/components/ui/PageSpinner'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useDictionary } from '@/contexts/DictionaryContext'

export default function HomePage() {
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang as string
  const { token } = useAuthStore()
  const { t } = useDictionary()

  useEffect(() => {
    if (token) {
      router.push(`/${lang}/dashboard`)
    } else {
      router.push(`/${lang}/auth/login`)
    }
  }, [token, router, lang])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <PageSpinner message={t('common.loading')} />
    </div>
  )
}
