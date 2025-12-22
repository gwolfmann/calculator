import React from 'react';
import { ValidationError } from '../types/calculator';

interface ErrorDisplayProps {
  errors: ValidationError[];
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="error-display">
      <h3>Validation Errors:</h3>
      {errors.map((error, index) => (
        <div key={index} className="error-item">
          <strong>{error.field}:</strong> {error.message}
        </div>
      ))}
    </div>
  );
};