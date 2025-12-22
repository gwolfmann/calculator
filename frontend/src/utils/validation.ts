import { ValidationError, BinaryOperation, UnaryOperation } from '../types/calculator';

export const validateNumber = (value: string, fieldName: string): ValidationError | null => {
  if (value.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`
    };
  }

  if (!isFinite(num)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a finite number`
    };
  }

  return null;
};

export const validateBinaryOperation = (
  operation: BinaryOperation, 
  a: string, 
  b: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const aError = validateNumber(a, 'First number (a)');
  if (aError) errors.push(aError);

  const bError = validateNumber(b, 'Second number (b)');
  if (bError) errors.push(bError);

  // Operation-specific validations
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);

  switch (operation) {
    case 'divide':
      if (bNum === 0) {
        errors.push({
          field: 'Second number (b)',
          message: 'Cannot divide by zero'
        });
      }
      break;

    case 'root':
      if (bNum === 0) {
        errors.push({
          field: 'Second number (b)',
          message: 'Cannot calculate 0th root'
        });
      }
      if (aNum < 0 && bNum % 2 === 0) {
        errors.push({
          field: 'First number (a)',
          message: 'Cannot calculate even root of negative number'
        });
      }
      break;

    case 'power':
      // Check for potential overflow with very large exponents
      if (Math.abs(aNum) > 1000 && Math.abs(bNum) > 10) {
        errors.push({
          field: 'Second number (b)',
          message: 'Exponent too large, may cause overflow'
        });
      }
      break;

    default:
      // No additional validation needed for other operations
      break;
  }

  return errors;
};

export const validateUnaryOperation = (
  operation: UnaryOperation, 
  a: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const aError = validateNumber(a, 'Number (a)');
  if (aError) errors.push(aError);

  // Operation-specific validations
  const aNum = parseFloat(a);

  switch (operation) {
    case 'inverse':
      if (aNum === 0) {
        errors.push({
          field: 'Number (a)',
          message: 'Cannot calculate inverse of zero'
        });
      }
      break;

    case 'negative':
      // No additional validation needed for negative
      break;

    case 'sqrt':
      if (aNum < 0) {
        errors.push({
          field: 'Number (a)',
          message: 'Cannot calculate square root of negative number'
        });
      }
      break;

    default:
      // No additional validation needed for other operations
      break;
  }

  return errors;
};

export const formatNumber = (num: number): string => {
  if (!isFinite(num)) {
    return 'Infinity';
  }

  // Handle very large or very small numbers
  if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-10 && num !== 0)) {
    return num.toExponential(6);
  }

  // Round to reasonable precision for display
  const rounded = Math.round(num * 1e10) / 1e10;
  
  // Remove trailing zeros
  const str = rounded.toString();
  if (str.includes('.')) {
    return str.replace(/\.?0+$/, '');
  }
  
  return str;
};

export const isValidOperationInput = (value: string): boolean => {
  const errors = validateNumber(value, 'test');
  return errors === null;
};
