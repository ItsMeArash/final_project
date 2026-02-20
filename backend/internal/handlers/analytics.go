package handlers

import (
	"admin-dashboard/internal/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AnalyticsResponse struct {
	KPIs       services.KPIStats     `json:"kpis"`
	LineChart  services.LineChartData `json:"line_chart"`
	BarChart   services.BarChartData  `json:"bar_chart"`
	PieChart   services.PieChartData  `json:"pie_chart"`
	AreaChart  services.AreaChartData `json:"area_chart"`
}

func GetAnalytics(c *gin.Context) {
	// Get query parameters
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	category := c.Query("category")

	// Parse dates or use defaults
	var startDate, endDate time.Time
	if startDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = parsed
		} else {
			startDate = time.Now().AddDate(0, -1, 0) // Default to 1 month ago
		}
	} else {
		startDate = time.Now().AddDate(0, -1, 0)
	}

	if endDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", endDateStr); err == nil {
			endDate = parsed
		} else {
			endDate = time.Now()
		}
	} else {
		endDate = time.Now()
	}

	// Generate mock analytics data
	analyticsService := services.NewAnalyticsService()
	data := analyticsService.GenerateAnalytics(startDate, endDate, category)

	c.JSON(http.StatusOK, AnalyticsResponse{
		KPIs:       data.KPIs,
		LineChart:  data.LineChart,
		BarChart:   data.BarChart,
		PieChart:   data.PieChart,
		AreaChart:  data.AreaChart,
	})
}
