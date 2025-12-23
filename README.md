# Calculator Service

A simple calculator built as:

- A Go + Gin HTTP API (server)
- A React + TypeScript UI (frontend)

## Design Rationale

### Backend (Go + Gin)

**Architecture Decisions:**
- **Service pattern**: Calculator logic encapsulated in a `Service` struct for testability and separation of concerns.
- **Structured logging (`slog`)**: Go 1.21+ standard library logger provides consistent, parseable log output.
- **RESTful API**: Both POST (JSON body) and GET (query params) endpoints for flexibility.
- **Input validation**: All operations validate inputs and return meaningful error messages.

### Frontend (React + TypeScript)

**Architecture Decisions:**
- **Single component state**: Calculator state managed in `ButtonCalculator` component using React hooks.
- **API service layer**: `calculatorApi.ts` abstracts HTTP calls, making it easy to mock in tests.
- **Responsive design**: CSS media queries and flexbox for mobile support with slide-in history drawer.
- **Keyboard support**: Full keyboard navigation for power users.

## Features

- Addition
- Subtraction
- Multiplication
- Division
- Percentage calculation
- Power operations (exponentiation)
- Square root operations
- Nth root operations
- Inverse operations (reciprocal)
- Negative operations (negation)
- Comprehensive structured logging
- Input validation
- Error handling

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running

### Calculator Operations

#### Binary Operations
All binary calculator endpoints accept a JSON body with two numbers `a` and `b`:
```json
{
    "a": 10,
    "b": 5
}
```

#### Unary Operations
All unary calculator endpoints accept a JSON body with one number `a`:
```json
{
    "a": 5
}
```

#### Binary Endpoints:
- `POST /api/v1/add` - Add two numbers
- `POST /api/v1/subtract` - Subtract b from a
- `POST /api/v1/multiply` - Multiply two numbers
- `POST /api/v1/divide` - Divide a by b
- `POST /api/v1/percentage` - Calculate percentage of a (b% of a)
- `POST /api/v1/power` - Calculate a to the power of b (a^b)
- `POST /api/v1/sqrt` - Calculate square root of a
- `POST /api/v1/root` - Calculate nth root of a (b is the root)

#### Unary Endpoints:
- `POST /api/v1/inverse` - Calculate inverse (1/a)
- `POST /api/v1/negative` - Calculate negative (-a)

### POST cURL Examples

**Binary Operations:**
```bash
# Addition
curl -X POST "http://localhost:8080/api/v1/add" \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5}'

# Subtraction
curl -X POST "http://localhost:8080/api/v1/subtract" \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5}'

# Multiplication
curl -X POST "http://localhost:8080/api/v1/multiply" \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5}'

# Division
curl -X POST "http://localhost:8080/api/v1/divide" \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5}'

# Percentage
curl -X POST "http://localhost:8080/api/v1/percentage" \
  -H "Content-Type: application/json" \
  -d '{"a": 100, "b": 10}'

# Power
curl -X POST "http://localhost:8080/api/v1/power" \
  -H "Content-Type: application/json" \
  -d '{"a": 2, "b": 3}'

# Square Root
curl -X POST "http://localhost:8080/api/v1/sqrt" \
  -H "Content-Type: application/json" \
  -d '{"a": 16, "b": 0}'

# Nth Root
curl -X POST "http://localhost:8080/api/v1/root" \
  -H "Content-Type: application/json" \
  -d '{"a": 27, "b": 3}'
```

**Unary Operations:**
```bash
# Inverse (1/a)
curl -X POST "http://localhost:8080/api/v1/inverse" \
  -H "Content-Type: application/json" \
  -d '{"a": 2}'

# Negative (-a)
curl -X POST "http://localhost:8080/api/v1/negative" \
  -H "Content-Type: application/json" \
  -d '{"a": 5}'
```

#### GET Endpoints:
All operations also support GET requests with query parameters:

**Binary Operations:**
- `GET /api/v1/add?a=10&b=5`
- `GET /api/v1/subtract?a=10&b=5`
- `GET /api/v1/multiply?a=10&b=5`
- `GET /api/v1/divide?a=10&b=5`
- `GET /api/v1/percentage?a=100&b=10`
- `GET /api/v1/power?a=2&b=3`
- `GET /api/v1/sqrt?a=16&b=0`
- `GET /api/v1/root?a=27&b=3`

**Unary Operations:**
- `GET /api/v1/inverse?a=2`
- `GET /api/v1/negative?a=5`

### cURL Examples

## Getting Started

## Project Structure

```
.
├── main.go                  # Go server entrypoint
├── internal/                # Go server implementation
├── frontend/                # React + TypeScript app
├── server-component.puml    # PlantUML component diagram (server)
└── client-component.puml    # PlantUML component diagram (frontend)
```

### Prerequisites
- Go 1.24 or higher
- Node.js 18+ (recommended) and npm

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   go mod tidy
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

#### 1) Start the Go server

```bash
go run main.go
```

The server will start on `http://localhost:8080`

#### 2) Start the React frontend

In a second terminal:

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Frontend  Server Connection

- The frontend calls the API at `http://localhost:8080/api/v1`.
- The Go server enables CORS for `http://localhost:3000`.

## Example Requests

### Add
```bash
curl -X POST http://localhost:8080/api/v1/add \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5}'

# Response: {"result":15}
```

### Percentage
```bash
curl -X POST http://localhost:8080/api/v1/percentage \
  -H "Content-Type: application/json" \
  -d '{"a": 100, "b": 10}'

# Response: {"result":10}  # 10% of 100
```

### Power
```bash
curl -X POST http://localhost:8080/api/v1/power \
  -H "Content-Type: application/json" \
  -d '{"a": 2, "b": 3}'

# Response: {"result":8}  # 2^3
```

### Square Root
```bash
curl -X POST http://localhost:8080/api/v1/sqrt \
  -H "Content-Type: application/json" \
  -d '{"a": 16, "b": 0}'

# Response: {"result":4}
```

### Nth Root
```bash
curl -X POST http://localhost:8080/api/v1/root \
  -H "Content-Type: application/json" \
  -d '{"a": 27, "b": 3}'

# Response: {"result":3}  # cube root of 27
```

### Inverse
```bash
curl -X POST http://localhost:8080/api/v1/inverse \
  -H "Content-Type: application/json" \
  -d '{"a": 2}'

# Response: {"result":0.5}  # 1/2
```

### Negative
```bash
curl -X POST http://localhost:8080/api/v1/negative \
  -H "Content-Type: application/json" \
  -d '{"a": 5}'

# Response: {"result":-5}
```

### GET Request Examples

**Binary Operations:**
```bash
# Addition
curl -X GET "http://localhost:8080/api/v1/add?a=10&b=5"

# Subtraction
curl -X GET "http://localhost:8080/api/v1/subtract?a=10&b=5"

# Multiplication
curl -X GET "http://localhost:8080/api/v1/multiply?a=10&b=5"

# Division
curl -X GET "http://localhost:8080/api/v1/divide?a=10&b=5"

# Percentage
curl -X GET "http://localhost:8080/api/v1/percentage?a=100&b=10"

# Power
curl -X GET "http://localhost:8080/api/v1/power?a=2&b=3"

# Square Root
curl -X GET "http://localhost:8080/api/v1/sqrt?a=16&b=0"

# Nth Root
curl -X GET "http://localhost:8080/api/v1/root?a=27&b=3"
```

**Unary Operations:**
```bash
# Inverse (1/a)
curl -X GET "http://localhost:8080/api/v1/inverse?a=2"

# Negative (-a)
curl -X GET "http://localhost:8080/api/v1/negative?a=5"
```

**Health Check:**
```bash
curl -X GET "http://localhost:8080/health"
```

## Logging

The calculator service uses Go's structured logging package (`log/slog`) to provide comprehensive logging for all operations. 

### Log Levels
- **INFO**: Request processing and successful operations
- **DEBUG**: Detailed operation execution details  
- **ERROR**: Failed operations and error conditions

### Logged Information
Each log entry includes structured key-value pairs with:
- `operation`: API endpoint path
- `method`: HTTP method (GET/POST)
- `a`, `b`: Input parameters (for binary operations)
- `a`: Input parameter (for unary operations)
- `result`: Operation result
- `error`: Error details (when applicable)

### Example Log Output
```
2025/12/20 21:29:32 INFO Processing binary operation request operation=/add method=POST a=5 b=3
2025/12/20 21:29:32 INFO Binary operation successful operation=/add method=POST a=5 b=3 result=8
2025/12/20 21:29:32 ERROR Division by zero attempted a=10 b=0
```

## Error Handling

- Invalid input will return a 400 Bad Request with an error message
- Division by zero will return a 400 Bad Request with an error message
- Square root of negative numbers will return a 400 Bad Request with an error message
- Zeroth root calculation will return a 400 Bad Request with an error message
- Even root of negative numbers will return a 400 Bad Request with an error message
- Inverse of zero will return a 400 Bad Request with an error message

### Error Response Example
```json
{
    "error": "cannot divide by zero"
}
```

## Testing

### Backend (Go)

The server includes comprehensive unit tests with 95%+ coverage. To run tests:

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Or directly with go
go test ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
```

### Frontend (React)

The frontend includes unit tests using Jest and React Testing Library.

```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests once with coverage (CI mode)
npm run test:ci

# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

**Test coverage includes:**
- Component rendering tests
- User interaction tests (number input, operations, clear)
- History panel toggle tests

## Development

### Build
```bash
make build
```

### Lint
```bash
make lint
```

### Format
```bash
make fmt
```

### All Checks
```bash
make check
```
