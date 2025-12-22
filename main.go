package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"calculator/internal/calculator"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Setup file logging
	logFile, err := os.OpenFile("calculator.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}
	defer logFile.Close()

	// Create a file-based logger
	fileLogger := slog.New(slog.NewJSONHandler(logFile, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))

	// Set the default logger to also write to file (optional - for other packages)
	slog.SetDefault(fileLogger)

	// Create a new Gin router
	r := gin.Default()

	// Configure CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Create calculator service with file logger
	calculatorService := &calculator.Service{
		Logger: fileLogger,
	}

	// Setup routes
	setupRoutes(r, calculatorService)

	// Start the server
	port := ":8080"
	log.Printf("Server starting on port %s\n", port)
	log.Printf("Logging to file: calculator.log\n")
	if err := r.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(r *gin.Engine, s *calculator.Service) {
	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Calculator endpoints
	api := r.Group("/api/v1")
	{
		// POST endpoints
		api.POST("/add", s.Add)
		api.POST("/subtract", s.Subtract)
		api.POST("/multiply", s.Multiply)
		api.POST("/divide", s.Divide)
		api.POST("/percentage", s.Percentage)
		api.POST("/power", s.Power)
		api.POST("/sqrt", s.Sqrt)
		api.POST("/root", s.Root)
		api.POST("/inverse", s.Inverse)
		api.POST("/negative", s.Negative)

		// GET endpoints
		api.GET("/add", s.AddGET)
		api.GET("/subtract", s.SubtractGET)
		api.GET("/multiply", s.MultiplyGET)
		api.GET("/divide", s.DivideGET)
		api.GET("/percentage", s.PercentageGET)
		api.GET("/power", s.PowerGET)
		api.GET("/sqrt", s.SqrtGET)
		api.GET("/root", s.RootGET)
		api.GET("/inverse", s.InverseGET)
		api.GET("/negative", s.NegativeGET)
	}
}
