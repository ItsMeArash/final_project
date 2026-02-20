'use client'

import { useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { WidgetCard } from './WidgetCard'
import { Cloud, Thermometer, Droplets, MapPin } from 'lucide-react'

const WEATHER_CITY_KEY = 'weather-city'
const DEFAULT_CITY = 'Tehran'

interface WttrResponse {
  current_condition?: Array<{
    temp_C: string
    FeelsLikeC: string
    weatherDesc: Array<{ value: string }>
    humidity: string
    weatherIconUrl?: Array<{ value: string }>
  }>
  request?: Array<{ query: string }>
}

async function fetchWeather(city: string): Promise<WttrResponse> {
  const res = await fetch(
    `https://wttr.in/${encodeURIComponent(city)}?format=j1`
  )
  if (!res.ok) throw new Error('Failed to fetch weather')
  return res.json()
}

function getStoredCity(): string {
  if (typeof window === 'undefined') return DEFAULT_CITY
  return localStorage.getItem(WEATHER_CITY_KEY) || DEFAULT_CITY
}

export function WeatherWidget() {
  const { t } = useDictionary()
  const city = getStoredCity()

  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  const condition = data?.current_condition?.[0]
  const location = data?.request?.[0]?.query ?? city

  return (
    <WidgetCard title={t('dashboard.widgets.weather')}>
      {isLoading && (
        <div className="flex h-24 items-center justify-center text-gray-500 dark:text-gray-400">
          {t('dashboard.weather.loading')}
        </div>
      )}
      {error && (
        <div className="flex h-24 flex-col items-center justify-center gap-1 text-center text-sm text-red-600 dark:text-red-400">
          {t('dashboard.weather.error')}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {location}
          </span>
        </div>
      )}
      {condition && !error && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Cloud className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {condition.temp_C}°C
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {condition.weatherDesc?.[0]?.value ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              {t('dashboard.weather.feelsLike')} {condition.FeelsLikeC}°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              {condition.humidity}%
            </span>
          </div>
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </p>
        </div>
      )}
    </WidgetCard>
  )
}
