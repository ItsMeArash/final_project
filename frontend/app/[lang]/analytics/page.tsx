'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { useDictionary } from '@/contexts/DictionaryContext'
import { useParams } from 'next/navigation'
import { analyticsService } from '@/services/analytics'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { format, subDays } from 'date-fns'
import dynamic from 'next/dynamic'
import Highcharts from 'highcharts'

const HighchartsReact = dynamic(() => import('highcharts-react-official'), {
  ssr: false,
})

const PERSIAN_FONT = "'Yekan Bakh FaNum', sans-serif"

function getChartFontOptions(lang: string): Highcharts.Options {
  if (lang !== 'fa') return {}
  return {
    chart: { style: { fontFamily: PERSIAN_FONT } },
    title: { style: { fontFamily: PERSIAN_FONT } },
    subtitle: { style: { fontFamily: PERSIAN_FONT } },
    xAxis: { labels: { style: { fontFamily: PERSIAN_FONT } } },
    yAxis: {
      title: { style: { fontFamily: PERSIAN_FONT } },
      labels: { style: { fontFamily: PERSIAN_FONT } },
    },
    legend: { itemStyle: { fontFamily: PERSIAN_FONT } },
    tooltip: { style: { fontFamily: PERSIAN_FONT } },
  }
}

function getChartThemeOptions(isDark: boolean): Highcharts.Options {
  if (!isDark) return { chart: { backgroundColor: 'transparent' } }
  const labelColor = '#e5e7eb'
  return {
    chart: { backgroundColor: 'transparent' },
    title: { style: { color: '#e5e7eb' } },
    xAxis: {
      gridLineColor: '#4b5563',
      labels: { style: { color: labelColor } },
      lineColor: '#4b5563',
      tickColor: '#4b5563',
    },
    yAxis: {
      gridLineColor: '#4b5563',
      labels: { style: { color: labelColor } },
      lineColor: '#4b5563',
      tickColor: '#4b5563',
      title: { style: { color: labelColor } },
    },
    legend: { itemStyle: { color: labelColor }, itemHoverStyle: { color: '#f9fafb' } },
    tooltip: {
      backgroundColor: '#374151',
      borderColor: '#4b5563',
      style: { color: '#e5e7eb' },
    },
    plotOptions: {
      series: {
        borderColor: '#374151',
      },
    },
  }
}

export default function AnalyticsPage() {
  const params = useParams()
  const lang = params?.lang as string
  const { resolvedTheme } = useTheme()
  const { t } = useDictionary()
  const fontOptions = getChartFontOptions(lang)
  const themeOptions = useMemo(
    () => getChartThemeOptions(resolvedTheme === 'dark'),
    [resolvedTheme]
  )
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [category, setCategory] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', startDate, endDate, category],
    queryFn: () =>
      analyticsService.getAnalytics({
        start_date: startDate,
        end_date: endDate,
        category,
      }),
  })

  const mergeTitle = (text: string) => ({
    ...fontOptions.title,
    ...themeOptions.title,
    style: {
      ...(themeOptions.title as Highcharts.TitleOptions)?.style,
      ...(fontOptions.title as Highcharts.TitleOptions)?.style,
    },
    text,
  })

  const mergeLegend = () => ({
    ...themeOptions.legend,
    ...fontOptions.legend,
    itemStyle: {
      ...(themeOptions.legend as Highcharts.LegendOptions)?.itemStyle,
      ...(fontOptions.legend as Highcharts.LegendOptions)?.itemStyle,
    },
  })

  const mergeAxisLabels = (axis: 'xAxis' | 'yAxis') => ({
    ...(themeOptions[axis] as Highcharts.XAxisOptions)?.labels,
    ...(fontOptions[axis] as Highcharts.XAxisOptions)?.labels,
    style: {
      ...(themeOptions[axis] as Highcharts.XAxisOptions)?.labels?.style,
      ...(fontOptions[axis] as Highcharts.XAxisOptions)?.labels?.style,
    },
  })

  const lineChartOptions: Highcharts.Options = {
    ...themeOptions,
    ...fontOptions,
    legend: mergeLegend(),
    title: mergeTitle(t('analytics.dailyActiveUsers')),
    xAxis: {
      ...themeOptions.xAxis,
      ...fontOptions.xAxis,
      labels: mergeAxisLabels('xAxis'),
      categories: data?.line_chart.labels || [],
    },
    yAxis: {
      ...themeOptions.yAxis,
      ...fontOptions.yAxis,
      labels: mergeAxisLabels('yAxis'),
      title: {
        ...(themeOptions.yAxis as Highcharts.YAxisOptions)?.title,
        ...(fontOptions.yAxis as Highcharts.YAxisOptions)?.title,
        text: t('analytics.users'),
      },
    },
    series:
      data?.line_chart.datasets.map((dataset) => ({
        type: 'line',
        name: dataset.label,
        data: dataset.data,
      })) || [],
  }

  const barChartOptions: Highcharts.Options = {
    ...themeOptions,
    ...fontOptions,
    legend: mergeLegend(),
    title: mergeTitle(t('analytics.monthlyRevenue')),
    xAxis: {
      ...themeOptions.xAxis,
      ...fontOptions.xAxis,
      labels: mergeAxisLabels('xAxis'),
      categories: data?.bar_chart.labels || [],
    },
    yAxis: {
      ...themeOptions.yAxis,
      ...fontOptions.yAxis,
      labels: mergeAxisLabels('yAxis'),
      title: {
        ...(themeOptions.yAxis as Highcharts.YAxisOptions)?.title,
        ...(fontOptions.yAxis as Highcharts.YAxisOptions)?.title,
        text: t('analytics.revenue'),
      },
    },
    series:
      data?.bar_chart.datasets.map((dataset) => ({
        type: 'column',
        name: dataset.label,
        data: dataset.data,
      })) || [],
  }

  const pieChartOptions: Highcharts.Options = {
    ...themeOptions,
    ...fontOptions,
    title: mergeTitle(t('analytics.categoryDistribution')),
    legend: mergeLegend(),
    chart: { ...themeOptions.chart, ...fontOptions.chart, type: 'pie' },
    series: [
      {
        type: 'pie',
        name: t('analytics.share'),
        data:
          data?.pie_chart.labels.map((label, index) => [
            label,
            data.pie_chart.datasets[index],
          ]) || [],
      },
    ],
  }

  const areaChartOptions: Highcharts.Options = {
    ...themeOptions,
    ...fontOptions,
    legend: mergeLegend(),
    title: mergeTitle(t('analytics.productPerformance')),
    xAxis: {
      ...themeOptions.xAxis,
      ...fontOptions.xAxis,
      labels: mergeAxisLabels('xAxis'),
      categories: data?.area_chart.labels || [],
    },
    yAxis: {
      ...themeOptions.yAxis,
      ...fontOptions.yAxis,
      labels: mergeAxisLabels('yAxis'),
      title: {
        ...(themeOptions.yAxis as Highcharts.YAxisOptions)?.title,
        ...(fontOptions.yAxis as Highcharts.YAxisOptions)?.title,
        text: t('analytics.value'),
      },
    },
    series:
      data?.area_chart.datasets.map((dataset) => ({
        type: 'area',
        name: dataset.label,
        data: dataset.data,
      })) || [],
  }

  return (
    <DashboardLayout requiredPermission="ANALYTICS_VIEW">
      <div>
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">{t('analytics.title')}</h1>

        <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('analytics.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('analytics.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('analytics.category')}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('analytics.filterByCategory')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <PageSpinner message={t('analytics.loadingAnalytics')} fullScreen={false} />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('analytics.totalUsers')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data?.kpis.total_users || 0}
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('analytics.activeUsers')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data?.kpis.active_users || 0}
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('analytics.revenue')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${data?.kpis.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('analytics.growthRate')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data?.kpis.growth_rate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('analytics.avgSession')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data?.kpis.avg_session_time?.toFixed(1) || 0}m
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <HighchartsReact highcharts={Highcharts} options={barChartOptions} />
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <HighchartsReact highcharts={Highcharts} options={pieChartOptions} />
              </div>
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <HighchartsReact highcharts={Highcharts} options={areaChartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
