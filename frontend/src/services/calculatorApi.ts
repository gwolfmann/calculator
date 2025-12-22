import { 
  CalculatorResponse, 
  ErrorResponse, 
  BinaryRequest, 
  UnaryRequest,
  BinaryOperation,
  UnaryOperation
} from '../types/calculator';

const API_BASE_URL = 'http://localhost:8080/api/v1';

class CalculatorApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Binary operations
  async performBinaryOperation(operation: BinaryOperation, request: BinaryRequest): Promise<CalculatorResponse> {
    const response = await fetch(`${API_BASE_URL}/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return this.handleResponse<CalculatorResponse>(response);
  }

  async performBinaryOperationGet(operation: BinaryOperation, a: number, b: number): Promise<CalculatorResponse> {
    const response = await fetch(`${API_BASE_URL}/${operation}?a=${a}&b=${b}`);
    return this.handleResponse<CalculatorResponse>(response);
  }

  // Unary operations
  async performUnaryOperation(operation: UnaryOperation, request: UnaryRequest): Promise<CalculatorResponse> {
    const response = await fetch(`${API_BASE_URL}/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return this.handleResponse<CalculatorResponse>(response);
  }

  async performUnaryOperationGet(operation: UnaryOperation, a: number): Promise<CalculatorResponse> {
    const response = await fetch(`${API_BASE_URL}/${operation}?a=${a}`);
    return this.handleResponse<CalculatorResponse>(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('http://localhost:8080/health');
    return this.handleResponse<{ status: string }>(response);
  }

  // Convenience methods for all operations
  async add(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('add', { a, b });
  }

  async subtract(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('subtract', { a, b });
  }

  async multiply(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('multiply', { a, b });
  }

  async divide(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('divide', { a, b });
  }

  async percentage(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('percentage', { a, b });
  }

  async power(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('power', { a, b });
  }

  async sqrt(a: number): Promise<CalculatorResponse> {
    return this.performUnaryOperation('sqrt', { a });
  }

  async root(a: number, b: number): Promise<CalculatorResponse> {
    return this.performBinaryOperation('root', { a, b });
  }

  async inverse(a: number): Promise<CalculatorResponse> {
    return this.performUnaryOperation('inverse', { a });
  }

  async negative(a: number): Promise<CalculatorResponse> {
    return this.performUnaryOperation('negative', { a });
  }
}

export const calculatorApi = new CalculatorApiService();
