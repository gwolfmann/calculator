package calculator

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestContext(method, url string, body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	var req *http.Request
	if body != nil {
		jsonValue, _ := json.Marshal(body)
		req, _ = http.NewRequest(method, url, bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, _ = http.NewRequest(method, url, nil)
	}

	c.Request = req
	return c, w
}

func assertResponse(t *testing.T, w *httptest.ResponseRecorder, expectedStatus int, expectedResult float64, expectedError string) {
	assert.Equal(t, expectedStatus, w.Code)

	if expectedStatus == http.StatusOK {
		var response Response
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.InDelta(t, expectedResult, response.Result, 0.0001) // Allow floating point precision
	} else {
		var errorResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &errorResponse)
		assert.NoError(t, err)
		errorMsg, ok := errorResponse["error"].(string)
		assert.True(t, ok, "Error response should contain error message")
		assert.Contains(t, errorMsg, expectedError)
	}
}

func setupTestUnaryContext(method, url string, body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	var req *http.Request
	if body != nil {
		reqBody, _ := json.Marshal(body)
		req, _ = http.NewRequest(method, url, bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, _ = http.NewRequest(method, url, nil)
	}
	c.Request = req

	return c, w
}

func testUnaryOperation(t *testing.T, opName string, testCases []struct {
	name           string
	a              string
	expectedStatus int
	expectedResult float64
	expectedError  string
}) {
	s := &Service{}

	for _, tt := range testCases {
		// Test GET
		t.Run(tt.name+" GET", func(t *testing.T) {
			c, w := setupTestUnaryContext("GET", "/"+opName+"?a="+tt.a, nil)

			switch opName {
			case "inverse":
				s.InverseGET(c)
			case "negative":
				s.NegativeGET(c)
			}

			assertResponse(t, w, tt.expectedStatus, tt.expectedResult, tt.expectedError)
		})

		// Test POST - only for valid numeric inputs or specific error cases
		if tt.expectedStatus == http.StatusOK || strings.Contains(tt.expectedError, "cannot calculate") {
			t.Run(tt.name+" POST", func(t *testing.T) {
				a, aErr := strconv.ParseFloat(tt.a, 64)

				// Skip POST test if values can't be parsed to float
				if aErr != nil {
					t.Skip("Skipping POST test due to invalid test values")
				}

				body := map[string]float64{"a": a}
				c, w := setupTestUnaryContext("POST", "/"+opName, body)

				// Adjust expectations for POST
				expectedStatus := tt.expectedStatus
				expectedError := tt.expectedError

				// For invalid parameter errors, the message will be different in POST
				if strings.Contains(tt.expectedError, "invalid value for parameter") {
					expectedStatus = http.StatusBadRequest
					expectedError = "Key: 'UnaryRequest"
				}

				switch opName {
				case "inverse":
					s.Inverse(c)
				case "negative":
					s.Negative(c)
				}

				assertResponse(t, w, expectedStatus, tt.expectedResult, expectedError)
			})
		}
	}
}

func testOperation(t *testing.T, opName string, testCases []struct {
	name           string
	a              string
	b              string
	expectedStatus int
	expectedResult float64
	expectedError  string
}) {
	s := &Service{}

	for _, tt := range testCases {
		// Test GET
		t.Run(tt.name+" GET", func(t *testing.T) {
			c, w := setupTestContext("GET", "/"+opName+"?a="+tt.a+"&b="+tt.b, nil)

			switch opName {
			case "add":
				s.AddGET(c)
			case "subtract":
				s.SubtractGET(c)
			case "multiply":
				s.MultiplyGET(c)
			case "divide":
				s.DivideGET(c)
			case "percentage":
				s.PercentageGET(c)
			case "power":
				s.PowerGET(c)
			case "sqrt":
				s.SqrtGET(c)
			case "root":
				s.RootGET(c)
			}

			assertResponse(t, w, tt.expectedStatus, tt.expectedResult, tt.expectedError)
		})

		// Test POST - only for valid numeric inputs or specific error cases
		if tt.expectedStatus == http.StatusOK || strings.Contains(tt.expectedError, "cannot divide by zero") || strings.Contains(tt.expectedError, "cannot calculate") {
			t.Run(tt.name+" POST", func(t *testing.T) {
				a, aErr := strconv.ParseFloat(tt.a, 64)
				b, bErr := strconv.ParseFloat(tt.b, 64)

				// Skip POST test if values can't be parsed to float
				if aErr != nil || bErr != nil {
					t.Skip("Skipping POST test due to invalid test values")
				}

				body := map[string]float64{"a": a, "b": b}
				c, w := setupTestContext("POST", "/"+opName, body)

				// Adjust expectations for POST
				expectedStatus := tt.expectedStatus
				expectedError := tt.expectedError

				// For invalid parameter errors, the message will be different in POST
				if strings.Contains(tt.expectedError, "invalid value for parameter") {
					expectedStatus = http.StatusBadRequest
					expectedError = "Key: 'Request"
				}

				// For division by zero, the error comes from the operation function
				// not from the binding, so keep the original error message
				if strings.Contains(tt.expectedError, "cannot divide by zero") {
					// Keep the original error message for division by zero
					expectedStatus = tt.expectedStatus
					expectedError = tt.expectedError
				}

				switch opName {
				case "add":
					s.Add(c)
				case "subtract":
					s.Subtract(c)
				case "multiply":
					s.Multiply(c)
				case "divide":
					s.Divide(c)
				case "percentage":
					s.Percentage(c)
				case "power":
					s.Power(c)
				case "sqrt":
					s.Sqrt(c)
				case "root":
					s.Root(c)
				}

				assertResponse(t, w, expectedStatus, tt.expectedResult, expectedError)
			})
		}
	}
}

// TestAdd tests both AddGET and Add handlers
func TestAdd(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"positive numbers", "5", "3", http.StatusOK, 8, ""},
		{"negative numbers", "-5", "-3", http.StatusOK, -8, ""},
		{"zero", "0", "5", http.StatusOK, 5, ""},
		{"decimal numbers", "2.5", "1.5", http.StatusOK, 4, ""},
		{"missing a", "", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "5", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "5", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "add", tests)
}

// TestSubtract tests both SubtractGET and Subtract handlers
func TestSubtract(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"positive numbers", "10", "3", http.StatusOK, 7, ""},
		{"negative numbers", "-5", "-3", http.StatusOK, -2, ""},
		{"zero", "0", "5", http.StatusOK, -5, ""},
		{"decimal numbers", "5.5", "2.5", http.StatusOK, 3, ""},
		{"result zero", "5", "5", http.StatusOK, 0, ""},
		{"missing a", "", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "5", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "5", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "subtract", tests)
}

// TestMultiply tests both MultiplyGET and Multiply handlers
func TestMultiply(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"positive numbers", "10", "3", http.StatusOK, 30, ""},
		{"negative numbers", "-5", "-3", http.StatusOK, 15, ""},
		{"zero", "0", "5", http.StatusOK, 0, ""},
		{"decimal numbers", "2.5", "1.1", http.StatusOK, 2.75, ""},
		{"negative and positive", "-5", "3", http.StatusOK, -15, ""},
		{"multiply by zero", "5", "0", http.StatusOK, 0, ""},
		{"zero by zero", "0", "0", http.StatusOK, 0, ""},
		{"missing a", "", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "5", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "5", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "multiply", tests)
}

// TestDivide tests both DivideGET and Divide handlers
func TestDivide(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"integer division", "10", "2", http.StatusOK, 5, ""},
		{"decimal result", "5", "2", http.StatusOK, 2.5, ""},
		{"negative division", "-10", "2", http.StatusOK, -5, ""},
		{"negative divisor", "10", "-2", http.StatusOK, -5, ""},
		{"decimal numbers", "2.5", "0.5", http.StatusOK, 5, ""},
		{"large numbers", "1000000", "1000", http.StatusOK, 1000, ""},
		{"divide by zero", "10", "0", http.StatusBadRequest, 0, "cannot divide by zero"},
		{"zero by zero", "0", "0", http.StatusBadRequest, 0, "cannot divide by zero"},
		{"missing a", "", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "5", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "3", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "5", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "divide", tests)
}

// TestPercentage tests both PercentageGET and Percentage handlers
func TestPercentage(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"basic percentage", "100", "10", http.StatusOK, 10, ""},
		{"decimal percentage", "80", "12.5", http.StatusOK, 10, ""},
		{"zero percentage", "50", "0", http.StatusOK, 0, ""},
		{"percentage of zero", "0", "25", http.StatusOK, 0, ""},
		{"large numbers", "1000000", "5", http.StatusOK, 50000, ""},
		{"small percentage", "1000", "0.1", http.StatusOK, 1, ""},
		{"over 100 percent", "100", "150", http.StatusOK, 150, ""},
		{"negative base", "-100", "20", http.StatusOK, -20, ""},
		{"missing a", "", "10", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "100", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "10", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "100", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "percentage", tests)
}

// TestPower tests both PowerGET and Power handlers
func TestPower(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"square", "2", "2", http.StatusOK, 4, ""},
		{"cube", "3", "3", http.StatusOK, 27, ""},
		{"power of zero", "5", "0", http.StatusOK, 1, ""},
		{"zero to power", "0", "5", http.StatusOK, 0, ""},
		{"decimal power", "4", "0.5", http.StatusOK, 2, ""},
		{"negative power", "2", "-2", http.StatusOK, 0.25, ""},
		{"fractional base", "9", "2", http.StatusOK, 81, ""},
		{"one to any power", "1", "10", http.StatusOK, 1, ""},
		{"missing a", "", "2", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "2", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "2", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "2", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "power", tests)
}

// TestSqrt tests both SqrtGET and Sqrt handlers
func TestSqrt(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"perfect square", "16", "0", http.StatusOK, 4, ""},
		{"non-perfect square", "2", "0", http.StatusOK, 1.4142135623730951, ""},
		{"zero", "0", "0", http.StatusOK, 0, ""},
		{"one", "1", "0", http.StatusOK, 1, ""},
		{"large number", "1000000", "0", http.StatusOK, 1000, ""},
		{"decimal", "2.25", "0", http.StatusOK, 1.5, ""},
		{"negative number", "-4", "0", http.StatusBadRequest, 0, "cannot calculate square root of negative number"},
		{"missing a", "", "0", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric a", "abc", "0", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"empty parameters", "", "0", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "sqrt", tests)
}

// TestRoot tests both RootGET and Root handlers
func TestRoot(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		b              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"square root", "16", "2", http.StatusOK, 4, ""},
		{"cube root", "27", "3", http.StatusOK, 3, ""},
		{"fourth root", "16", "4", http.StatusOK, 2, ""},
		{"root of one", "1", "5", http.StatusOK, 1, ""},
		{"zero root", "0", "3", http.StatusOK, 0, ""},
		{"fractional base", "0.125", "3", http.StatusOK, 0.5, ""},
		{"zeroth root", "16", "0", http.StatusBadRequest, 0, "cannot calculate 0th root"},
		{"even root of negative", "-16", "2", http.StatusBadRequest, 0, "cannot calculate even root of negative number"},
		{"odd root of negative", "-27", "3", http.StatusOK, -3, ""},
		{"missing a", "", "2", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"missing b", "16", "", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"non-numeric a", "abc", "2", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric b", "16", "xyz", http.StatusBadRequest, 0, "invalid value for parameter 'b'"},
		{"empty parameters", "", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testOperation(t, "root", tests)
}

// TestInverse tests both InverseGET and Inverse handlers
func TestInverse(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"positive number", "2", http.StatusOK, 0.5, ""},
		{"fraction", "0.25", http.StatusOK, 4, ""},
		{"negative number", "-4", http.StatusOK, -0.25, ""},
		{"one", "1", http.StatusOK, 1, ""},
		{"zero", "0", http.StatusBadRequest, 0, "cannot calculate inverse of zero"},
		{"large number", "1000", http.StatusOK, 0.001, ""},
		{"missing a", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric a", "abc", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"empty parameters", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testUnaryOperation(t, "inverse", tests)
}

// TestNegative tests both NegativeGET and Negative handlers
func TestNegative(t *testing.T) {
	tests := []struct {
		name           string
		a              string
		expectedStatus int
		expectedResult float64
		expectedError  string
	}{
		{"positive number", "5", http.StatusOK, -5, ""},
		{"negative number", "-3.2", http.StatusOK, 3.2, ""},
		{"zero", "0", http.StatusOK, 0, ""},
		{"decimal", "2.5", http.StatusOK, -2.5, ""},
		{"large number", "1000000", http.StatusOK, -1000000, ""},
		{"missing a", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"non-numeric a", "abc", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
		{"empty parameters", "", http.StatusBadRequest, 0, "invalid value for parameter 'a'"},
	}

	testUnaryOperation(t, "negative", tests)
}
