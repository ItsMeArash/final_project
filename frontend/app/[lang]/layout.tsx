import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, type Locale } from '@/i18n-config'
import { getDictionary } from '@/get-dictionary'
import { DictionaryProvider } from '@/contexts/DictionaryContext'
import { Providers } from '@/components/providers/Providers'
import { LangDirUpdater } from '@/components/i18n/LangDirUpdater'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Modular Admin Dashboard with Multi-step Authentication',
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fa' }]
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dictionary = await getDictionary(lang as Locale)

  return (
    <DictionaryProvider dictionary={dictionary}>
      <LangDirUpdater />
      <Providers>{children}</Providers>
    </DictionaryProvider>
  )
}
