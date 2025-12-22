package calculator

import (
	"errors"
	"io"
	"log/slog"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Request represents the calculator operation request
type Request struct {
	A float64 `json:"a" form:"a"`
	B float64 `json:"b" form:"b"`
}

// UnaryRequest represents the unary operation request
type UnaryRequest struct {
	A float64 `json:"a" form:"a"`
}

// Response represents the calculator operation response
type Response struct {
	Result float64 `json:"result"`
}

// Service handles calculator operations
type Service struct {
	Logger *slog.Logger
}

// logger returns a safe logger (never nil). If Logger is nil, returns a no-op logger.
func (s *Service) logger() *slog.Logger {
	if s.Logger != nil {
		return s.Logger
	}
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

// OperationFunc defines the signature for calculator operations
type OperationFunc func(a, b float64) (float64, error)

// UnaryOperationFunc defines the signature for unary operations
type UnaryOperationFunc func(a float64) (float64, error)

// Add handles addition operation
func (s *Service) Add(c *gin.Context) {
	s.handleOperation(c, s.add)
}

// AddGET handles addition operation via GET
func (s *Service) AddGET(c *gin.Context) {
	s.handleGetOperation(c, s.add)
}

// Subtract handles subtraction operation
func (s *Service) Subtract(c *gin.Context) {
	s.handleOperation(c, s.subtract)
}

// SubtractGET handles subtraction operation via GET
func (s *Service) SubtractGET(c *gin.Context) {
	s.handleGetOperation(c, s.subtract)
}

// Multiply handles multiplication operation
func (s *Service) Multiply(c *gin.Context) {
	s.handleOperation(c, s.multiply)
}

// MultiplyGET handles multiplication operation via GET
func (s *Service) MultiplyGET(c *gin.Context) {
	s.handleGetOperation(c, s.multiply)
}

// Divide handles division operation
func (s *Service) Divide(c *gin.Context) {
	s.handleOperation(c, s.divide)
}

// DivideGET handles division operation via GET
func (s *Service) DivideGET(c *gin.Context) {
	s.handleGetOperation(c, s.divide)
}

// Percentage handles percentage operation
func (s *Service) Percentage(c *gin.Context) {
	s.handleOperation(c, s.percentage)
}

// PercentageGET handles percentage operation via GET
func (s *Service) PercentageGET(c *gin.Context) {
	s.handleGetOperation(c, s.percentage)
}

// Power handles power operation
func (s *Service) Power(c *gin.Context) {
	s.handleOperation(c, s.power)
}

// PowerGET handles power operation via GET
func (s *Service) PowerGET(c *gin.Context) {
	s.handleGetOperation(c, s.power)
}

// Sqrt handles square root operation
func (s *Service) Sqrt(c *gin.Context) {
	s.handleOperation(c, s.sqrt)
}

// SqrtGET handles square root operation via GET
func (s *Service) SqrtGET(c *gin.Context) {
	s.handleGetOperation(c, s.sqrt)
}

// Root handles nth root operation
func (s *Service) Root(c *gin.Context) {
	s.handleOperation(c, s.root)
}

// RootGET handles nth root operation via GET
func (s *Service) RootGET(c *gin.Context) {
	s.handleGetOperation(c, s.root)
}

// Inverse handles inverse operation
func (s *Service) Inverse(c *gin.Context) {
	s.handleUnaryOperation(c, s.inverse)
}

// InverseGET handles inverse operation via GET
func (s *Service) InverseGET(c *gin.Context) {
	s.handleGetUnaryOperation(c, s.inverse)
}

// Negative handles negative operation
func (s *Service) Negative(c *gin.Context) {
	s.handleUnaryOperation(c, s.negative)
}

// NegativeGET handles negative operation via GET
func (s *Service) NegativeGET(c *gin.Context) {
	s.handleGetUnaryOperation(c, s.negative)
}

// handleOperation handles the common logic for all operations via POST
func (s *Service) handleOperation(c *gin.Context, op OperationFunc) {
	var req Request
	if err := c.ShouldBindJSON(&req); err != nil {
		s.logger().Error("Failed to bind JSON request", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.logger().Info("Processing binary operation request", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", req.A, "b", req.B)

	result, err := op(req.A, req.B)
	if err != nil {
		s.logger().Error("Binary operation failed", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", req.A, "b", req.B, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.logger().Info("Binary operation successful", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", req.A, "b", req.B, "result", result)
	c.JSON(http.StatusOK, Response{Result: result})
}

// handleGetOperation handles the common logic for all operations via GET
func (s *Service) handleGetOperation(c *gin.Context, op OperationFunc) {
	aStr := c.Query("a")
	bStr := c.Query("b")

	s.logger().Info("Processing binary operation GET request", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", aStr, "b", bStr)

	a, err := strconv.ParseFloat(aStr, 64)
	if err != nil {
		s.logger().Error("Failed to parse parameter 'a'", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", aStr, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid value for parameter 'a'"})
		return
	}

	b, err := strconv.ParseFloat(bStr, 64)
	if err != nil {
		s.logger().Error("Failed to parse parameter 'b'", "operation", c.Request.URL.Path, "method", c.Request.Method, "b", bStr, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid value for parameter 'b'"})
		return
	}

	s.logger().Debug("Parsed binary operation GET parameters", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", a, "b", b)

	result, err := op(a, b)
	if err != nil {
		s.logger().Error("Binary operation GET failed", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", a, "b", b, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.logger().Info("Binary operation GET successful", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", a, "b", b, "result", result)
	c.JSON(http.StatusOK, Response{Result: result})
}

// handleUnaryOperation handles the common logic for unary operations via POST
func (s *Service) handleUnaryOperation(c *gin.Context, op UnaryOperationFunc) {
	var req UnaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		s.logger().Error("Failed to bind unary JSON request", "operation", c.Request.URL.Path, "method", c.Request.Method, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.logger().Info("Processing unary operation request", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", req.A)

	result, err := op(req.A)
	if err != nil {
		s.logger().Error("Unary operation failed", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", req.A, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.logger().Info("Unary operation successful", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", req.A, "result", result)
	c.JSON(http.StatusOK, Response{Result: result})
}

// handleGetUnaryOperation handles the common logic for unary operations via GET
func (s *Service) handleGetUnaryOperation(c *gin.Context, op UnaryOperationFunc) {
	aStr := c.Query("a")

	s.logger().Info("Processing unary operation GET request", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", aStr)

	a, err := strconv.ParseFloat(aStr, 64)
	if err != nil {
		s.logger().Error("Failed to parse unary parameter 'a'", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", aStr, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid value for parameter 'a'"})
		return
	}

	s.logger().Debug("Parsed unary operation GET parameter", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", a)

	result, err := op(a)
	if err != nil {
		s.logger().Error("Unary operation GET failed", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", a, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.logger().Info("Unary operation GET successful", "operation", c.Request.URL.Path, "method", c.Request.Method, "a", a, "result", result)
	c.JSON(http.StatusOK, Response{Result: result})
}

// Core operation implementations
func (s *Service) add(a, b float64) (float64, error) {
	s.logger().Debug("Performing addition", "a", a, "b", b)
	result := a + b
	s.logger().Debug("Addition result", "result", result)
	return result, nil
}

func (s *Service) subtract(a, b float64) (float64, error) {
	s.logger().Debug("Performing subtraction", "a", a, "b", b)
	result := a - b
	s.logger().Debug("Subtraction result", "result", result)
	return result, nil
}

func (s *Service) multiply(a, b float64) (float64, error) {
	s.logger().Debug("Performing multiplication", "a", a, "b", b)
	result := a * b
	s.logger().Debug("Multiplication result", "result", result)
	return result, nil
}

func (s *Service) divide(a, b float64) (float64, error) {
	s.logger().Debug("Performing division", "a", a, "b", b)
	if b == 0 {
		s.logger().Error("Division by zero attempted", "a", a, "b", b)
		return 0, errors.New("cannot divide by zero")
	}
	result := a / b
	s.logger().Debug("Division result", "result", result)
	return result, nil
}

func (s *Service) percentage(a, b float64) (float64, error) {
	s.logger().Debug("Performing percentage", "a", a, "b", b)
	result := a * (b / 100)
	s.logger().Debug("Percentage result", "result", result)
	return result, nil
}

func (s *Service) power(a, b float64) (float64, error) {
	s.logger().Debug("Performing power operation", "a", a, "b", b)
	result := math.Pow(a, b)
	s.logger().Debug("Power result", "result", result)
	return result, nil
}

func (s *Service) sqrt(a, b float64) (float64, error) {
	s.logger().Debug("Performing square root", "a", a)
	if a < 0 {
		s.logger().Error("Square root of negative number attempted", "a", a)
		return 0, errors.New("cannot calculate square root of negative number")
	}
	result := math.Sqrt(a)
	s.logger().Debug("Square root result", "result", result)
	return result, nil
}

func (s *Service) root(a, b float64) (float64, error) {
	s.logger().Debug("Performing nth root", "a", a, "b", b)
	if b == 0 {
		s.logger().Error("Zeroth root attempted", "a", a, "b", b)
		return 0, errors.New("cannot calculate 0th root")
	}
	if a < 0 {
		// Check if the root is odd (can handle negative numbers)
		if math.Mod(b, 2) == 1 {
			// Odd root of negative number
			s.logger().Debug("Performing odd root of negative number", "a", a, "b", b)
			result := -math.Pow(-a, 1/b)
			s.logger().Debug("Odd root of negative result", "result", result)
			return result, nil
		}
		s.logger().Error("Even root of negative number attempted", "a", a, "b", b)
		return 0, errors.New("cannot calculate even root of negative number")
	}
	result := math.Pow(a, 1/b)
	s.logger().Debug("Nth root result", "result", result)
	return result, nil
}

func (s *Service) inverse(a float64) (float64, error) {
	s.logger().Debug("Performing inverse", "a", a)
	if a == 0 {
		s.logger().Error("Inverse of zero attempted", "a", a)
		return 0, errors.New("cannot calculate inverse of zero")
	}
	result := 1 / a
	s.logger().Debug("Inverse result", "result", result)
	return result, nil
}

func (s *Service) negative(a float64) (float64, error) {
	s.logger().Debug("Performing negation", "a", a)
	result := -a
	s.logger().Debug("Negation result", "result", result)
	return result, nil
}
