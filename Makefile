# Makefile for Calculator Service

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Binary names
BINARY_NAME=calculator
BINARY_UNIX=$(BINARY_NAME)_unix

# Build the application
build:
	$(GOBUILD) -o $(BINARY_NAME) -v ./main.go

# Build for Linux
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BINARY_UNIX) -v ./main.go

# Clean build files
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
	rm -f $(BINARY_UNIX)

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with coverage
test-coverage:
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

# Run linter
lint:
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run; \
	else \
		$(shell go env GOPATH)/bin/golangci-lint run; \
	fi

# Install linter if not present
install-lint:
	$(GOGET) -u github.com/golangci/golangci-lint/cmd/golangci-lint

# Download dependencies
deps:
	$(GOMOD) download
	$(GOMOD) tidy
	@if ! command -v golangci-lint &> /dev/null; then \
		echo "Installing golangci-lint..."; \
		curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(shell go env GOPATH)/bin latest; \
	else \
		echo "golangci-lint already installed"; \
	fi

# Run the application
run:
	$(GOCMD) run main.go

# Format code
fmt:
	$(GOCMD) fmt ./...

# Vet code
vet:
	$(GOCMD) vet ./...

# All checks (fmt, vet, lint, test)
check: fmt vet lint test

# Development workflow
dev: deps check build run

# Production build
prod: clean deps test build

# Help
help:
	@echo "Available targets:"
	@echo "  build          - Build the application"
	@echo "  build-linux    - Build for Linux"
	@echo "  clean          - Clean build files"
	@echo "  test           - Run tests"
	@echo "  test-coverage  - Run tests with coverage report"
	@echo "  lint           - Run linter"
	@echo "  install-lint   - Install golangci-lint"
	@echo "  deps           - Download dependencies"
	@echo "  run            - Run the application"
	@echo "  fmt            - Format code"
	@echo "  vet            - Vet code"
	@echo "  check          - Run all checks (fmt, vet, lint, test)"
	@echo "  dev            - Development workflow (deps, check, build, run)"
	@echo "  prod           - Production build (clean, deps, test, build)"
	@echo "  help           - Show this help message"

.PHONY: build build-linux clean test test-coverage lint install-lint deps run fmt vet check dev prod help
