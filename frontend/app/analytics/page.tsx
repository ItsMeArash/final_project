'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { analyticsService } from '@/services/analytics'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { format, subDays } from 'date-fns'
import dynamic from 'next/dynamic'

// Dynamically import Highcharts to avoid SSR issues
const HighchartsReact = dynamic(() => import('highcharts-react-official'), {
  ssr: false,
})
import Highcharts from 'highcharts'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [category, setCategory] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', startDate, endDate, category],
    queryFn: () => analyticsService.getAnalytics({ start_date: startDate, end_date: endDate, category }),
  })

  const lineChartOptions: Highcharts.Options = {
    title: { text: t('analytics.dailyActiveUsers') },
    xAxis: { categories: data?.line_chart.labels || [] },
    yAxis: { title: { text: t('analytics.users') } },
    series: data?.line_chart.datasets.map((dataset) => ({
      type: 'line',
      name: dataset.label,
      data: dataset.data,
    })) || [],
  }

  const barChartOptions: Highcharts.Options = {
    title: { text: t('analytics.monthlyRevenue') },
    xAxis: { categories: data?.bar_chart.labels || [] },
    yAxis: { title: { text: t('analytics.revenue') } },
    series: data?.bar_chart.datasets.map((dataset) => ({
      type: 'column',
      name: dataset.label,
      data: dataset.data,
    })) || [],
  }

  const pieChartOptions: Highcharts.Options = {
    title: { text: t('analytics.categoryDistribution') },
    chart: { type: 'pie' },
    series: [
      {
        type: 'pie',
        name: t('analytics.share'),
        data: data?.pie_chart.labels.map((label, index) => [
          label,
          data.pie_chart.datasets[index],
        ]) || [],
      },
    ],
  }

  const areaChartOptions: Highcharts.Options = {
    title: { text: t('analytics.productPerformance') },
    xAxis: { categories: data?.area_chart.labels || [] },
    yAxis: { title: { text: t('analytics.value') } },
    series: data?.area_chart.datasets.map((dataset) => ({
      type: 'area',
      name: dataset.label,
      data: dataset.data,
    })) || [],
  }

  return (
    <DashboardLayout requiredPermission="ANALYTICS_VIEW">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('analytics.title')}</h1>

        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('analytics.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('analytics.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('analytics.category')}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('analytics.filterByCategory')}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <PageSpinner message={t('analytics.loadingAnalytics')} fullScreen={false} />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">{t('analytics.totalUsers')}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.kpis.total_users || 0}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">{t('analytics.activeUsers')}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.kpis.active_users || 0}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">{t('analytics.revenue')}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ${data?.kpis.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">{t('analytics.growthRate')}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.kpis.growth_rate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">{t('analytics.avgSession')}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.kpis.avg_session_time?.toFixed(1) || 0}m
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <HighchartsReact highcharts={Highcharts} options={barChartOptions} />
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <HighchartsReact highcharts={Highcharts} options={pieChartOptions} />
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <HighchartsReact highcharts={Highcharts} options={areaChartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
