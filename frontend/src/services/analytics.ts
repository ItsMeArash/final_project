import api from './api'

export interface KPIStats {
  total_users: number
  active_users: number
  total_revenue: number
  growth_rate: number
  avg_session_time: number
}

export interface LineChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
  }>
}

export interface BarChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
  }>
}

export interface PieChartData {
  labels: string[]
  datasets: number[]
}

export interface AreaChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
  }>
}

export interface AnalyticsResponse {
  kpis: KPIStats
  line_chart: LineChartData
  bar_chart: BarChartData
  pie_chart: PieChartData
  area_chart: AreaChartData
}

export const analyticsService = {
  getAnalytics: async (params?: {
    start_date?: string
    end_date?: string
    category?: string
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics', { params })
    return response.data
  },
}
