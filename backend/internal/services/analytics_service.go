package services

import (
	"math/rand"
	"time"
)

type KPIStats struct {
	TotalUsers     int     `json:"total_users"`
	ActiveUsers    int     `json:"active_users"`
	TotalRevenue   float64 `json:"total_revenue"`
	GrowthRate     float64 `json:"growth_rate"`
	AvgSessionTime float64 `json:"avg_session_time"`
}

type LineChartData struct {
	Labels   []string    `json:"labels"`
	Datasets []LineDataset `json:"datasets"`
}

type LineDataset struct {
	Label string    `json:"label"`
	Data  []float64 `json:"data"`
}

type BarChartData struct {
	Labels   []string    `json:"labels"`
	Datasets []BarDataset `json:"datasets"`
}

type BarDataset struct {
	Label string    `json:"label"`
	Data  []float64 `json:"data"`
}

type PieChartData struct {
	Labels   []string  `json:"labels"`
	Datasets []float64 `json:"datasets"`
}

type AreaChartData struct {
	Labels   []string    `json:"labels"`
	Datasets []AreaDataset `json:"datasets"`
}

type AreaDataset struct {
	Label string    `json:"label"`
	Data  []float64 `json:"data"`
}

type AnalyticsData struct {
	KPIs       KPIStats
	LineChart  LineChartData
	BarChart   BarChartData
	PieChart   PieChartData
	AreaChart  AreaChartData
}

type AnalyticsService struct {
	rng *rand.Rand
}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{
		rng: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

func (as *AnalyticsService) GenerateAnalytics(startDate, endDate time.Time, category string) AnalyticsData {
	days := int(endDate.Sub(startDate).Hours() / 24)
	if days < 1 {
		days = 30
	}

	// Generate KPI stats
	kpis := KPIStats{
		TotalUsers:     500 + as.rng.Intn(200),
		ActiveUsers:    350 + as.rng.Intn(100),
		TotalRevenue:   float64(50000 + as.rng.Intn(20000)),
		GrowthRate:     12.5 + as.rng.Float64()*10,
		AvgSessionTime: 15.5 + as.rng.Float64()*10,
	}

	// Generate line chart data (time series)
	labels := make([]string, days)
	data := make([]float64, days)
	for i := 0; i < days; i++ {
		date := startDate.AddDate(0, 0, i)
		labels[i] = date.Format("2006-01-02")
		data[i] = 100 + as.rng.Float64()*200
	}

	lineChart := LineChartData{
		Labels: labels,
		Datasets: []LineDataset{
			{
				Label: "Daily Active Users",
				Data:  data,
			},
		},
	}

	// Generate bar chart data
	barLabels := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun"}
	barData := make([]float64, len(barLabels))
	for i := range barData {
		barData[i] = float64(1000 + as.rng.Intn(500))
	}

	barChart := BarChartData{
		Labels: barLabels,
		Datasets: []BarDataset{
			{
				Label: "Monthly Revenue",
				Data:  barData,
			},
		},
	}

	// Generate pie chart data
	pieLabels := []string{"Category A", "Category B", "Category C", "Category D"}
	pieData := make([]float64, len(pieLabels))
	total := 0.0
	for i := range pieData {
		pieData[i] = float64(20 + as.rng.Intn(30))
		total += pieData[i]
	}

	pieChart := PieChartData{
		Labels:   pieLabels,
		Datasets: pieData,
	}

	// Generate area chart data
	areaLabels := make([]string, days)
	areaData1 := make([]float64, days)
	areaData2 := make([]float64, days)
	for i := 0; i < days; i++ {
		date := startDate.AddDate(0, 0, i)
		areaLabels[i] = date.Format("2006-01-02")
		areaData1[i] = 50 + as.rng.Float64()*100
		areaData2[i] = 30 + as.rng.Float64()*80
	}

	areaChart := AreaChartData{
		Labels: areaLabels,
		Datasets: []AreaDataset{
			{
				Label: "Product A",
				Data:  areaData1,
			},
			{
				Label: "Product B",
				Data:  areaData2,
			},
		},
	}

	return AnalyticsData{
		KPIs:       kpis,
		LineChart:  lineChart,
		BarChart:   barChart,
		PieChart:   pieChart,
		AreaChart:  areaChart,
	}
}
