// API Response types
export interface CalculatorResponse {
  result: number;
}

export interface ErrorResponse {
  error: string;
}

// Binary operation request types
export interface BinaryRequest {
  a: number;
  b: number;
}

// Unary operation request types
export interface UnaryRequest {
  a: number;
}

// Operation types for UI
export type BinaryOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'percentage' | 'power' | 'root';
export type UnaryOperation = 'inverse' | 'negative' | 'sqrt';

export type Operation = BinaryOperation | UnaryOperation;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

// UI state types
export interface CalculationState {
  isLoading: boolean;
  error: string | null;
  result: number | null;
}

export interface HistoryItem {
  id: string;
  operation: Operation;
  inputs: BinaryRequest | UnaryRequest;
  result: number;
  timestamp: Date;
  error?: string;
}
