import React, { useState, useCallback, useEffect } from 'react';
import { calculatorApi } from '../services/calculatorApi';
import { BinaryOperation, UnaryOperation, HistoryItem } from '../types/calculator';
import { History } from './History';
import './ButtonCalculator.css';

export const ButtonCalculator: React.FC = () => {
  const [display, setDisplay] = useState<string>("0");
  const [currentValue, setCurrentValue] = useState<string>("");
  const [previousValue, setPreviousValue] = useState<string>("");
  const [operation, setOperation] = useState<BinaryOperation | UnaryOperation | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastEquation, setLastEquation] = useState<string>("");
  const [justCalculated, setJustCalculated] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const isUnaryOperation = (op: BinaryOperation | UnaryOperation): op is UnaryOperation => {
    return ["inverse", "negative", "sqrt"].includes(op);
  };

  const getOperationSymbol = (op: BinaryOperation | UnaryOperation): string => {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      case 'power': return '^';
      case 'percentage': return '%';
      case 'root': return '∛';
      case 'sqrt': return '√';
      case 'inverse': return '1/x';
      case 'negative': return '-/+';
      default: return op;
    }
  };

  const clearAll = useCallback(() => {
    setDisplay("0");
    setCurrentValue("");
    setPreviousValue("");
    setOperation(null);
    setWaitingForNewValue(false);
    setError("");
    setLastEquation("");
    setJustCalculated(false);
  }, []);

  const addToHistory = useCallback((operation: BinaryOperation | UnaryOperation, inputs: { a: number; b?: number }, result: number, error?: string) => {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      operation,
      inputs,
      result,
      timestamp: new Date(),
      error
    };
    setHistory(prev => [historyItem, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
    setCurrentValue("");
    setError("");
  }, []);

  const inputNumber = useCallback((num: string) => {
    if (justCalculated) {
      // After calculation, start completely fresh
      setDisplay(num);
      setCurrentValue(num);
      setPreviousValue("");
      setOperation(null);
      setWaitingForNewValue(false);
      setLastEquation("");
      setJustCalculated(false);
    } else if (waitingForNewValue) {
      // After pressing an operation, just replace the display for second operand
      setDisplay(num);
      setCurrentValue(num);
      setWaitingForNewValue(false);
    } else {
      // Normal number input - append to current display
      const newDisplay = display === "0" ? num : display + num;
      setDisplay(newDisplay);
      setCurrentValue(newDisplay);
    }
  }, [display, waitingForNewValue, justCalculated]);

  const inputDecimal = useCallback(() => {
    if (justCalculated) {
      // After calculation, start completely fresh with decimal
      setDisplay("0.");
      setCurrentValue("0.");
      setPreviousValue("");
      setOperation(null);
      setWaitingForNewValue(false);
      setLastEquation("");
      setJustCalculated(false);
    } else if (waitingForNewValue) {
      // After pressing an operation, start fresh decimal for second operand
      setDisplay("0.");
      setCurrentValue("0.");
      setWaitingForNewValue(false);
    } else if (!display.includes(".")) {
      // Normal decimal input - append to current display
      setDisplay(display + ".");
      setCurrentValue(display + ".");
    }
  }, [display, waitingForNewValue, justCalculated]);

  const performOperation = useCallback(async (nextOperation: BinaryOperation | UnaryOperation) => {
    // Use display as the primary source since it's always up-to-date
    // currentValue might be stale due to React state batching
    const inputValue = parseFloat(display);
    setError("");

    // If we just calculated and a BINARY operation is pressed, use result as first input
    if (justCalculated && !isUnaryOperation(nextOperation)) {
      setPreviousValue(display);
      setOperation(nextOperation);
      setWaitingForNewValue(true);
      setJustCalculated(false);
      return;
    }

    // For unary operations, perform immediately
    if (isUnaryOperation(nextOperation)) {
      // Use the display value if we just calculated, otherwise use input value
      const unaryInput = justCalculated ? parseFloat(display) : inputValue;
      
      setIsLoading(true);
      try {
        let response;

        switch (nextOperation) {
          case "inverse":
            response = await calculatorApi.inverse(unaryInput);
            break;
          case "negative":
            response = await calculatorApi.negative(unaryInput);
            break;
          case "sqrt":
            response = await calculatorApi.sqrt(unaryInput);
            break;
        }

        if (response) {
          const equation = `${getOperationSymbol(nextOperation)}(${unaryInput}) = ${response.result}`;
          setLastEquation(equation);
          setDisplay(response.result.toString());
          setCurrentValue(response.result.toString());
          // Add to history
          addToHistory(nextOperation, { a: unaryInput }, response.result);
          // Reset state for next calculation but preserve operation
          setPreviousValue("");
          setWaitingForNewValue(true);
          setJustCalculated(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Calculation error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For binary operations, check if we need to calculate first
    if (operation && !waitingForNewValue) {
      // Calculate previous operation first
      setIsLoading(true);
      try {
        const a = parseFloat(previousValue);
        const b = parseFloat(currentValue);
        let response;

        switch (operation) {
          case "add":
            response = await calculatorApi.add(a, b);
            break;
          case "subtract":
            response = await calculatorApi.subtract(a, b);
            break;
          case "multiply":
            response = await calculatorApi.multiply(a, b);
            break;
          case "divide":
            response = await calculatorApi.divide(a, b);
            break;
          case "power":
            response = await calculatorApi.power(a, b);
            break;
          case "percentage":
            response = await calculatorApi.percentage(a, b);
            break;
          case "root":
            response = await calculatorApi.root(a, b);
            break;
        }

        if (response) {
          const equation = `${previousValue} ${getOperationSymbol(operation)} ${currentValue} = ${response.result}`;
          setLastEquation(equation);
          setDisplay(response.result.toString());
          setCurrentValue(response.result.toString());
          // Add to history
          addToHistory(operation, { a, b }, response.result);
          // Use the result as the first operand for the next operation
          setPreviousValue(response.result.toString());
          setOperation(nextOperation);
          setWaitingForNewValue(true);
          setJustCalculated(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Calculation error");
      } finally {
        setIsLoading(false);
      }
    } else {
      // No previous operation, just set up for the new one
      setPreviousValue(inputValue.toString());
      setOperation(nextOperation);
      setWaitingForNewValue(true);
      setJustCalculated(false);
    }
  }, [currentValue, display, operation, waitingForNewValue, justCalculated]);

  const calculate = useCallback(async () => {
    if (!operation || !previousValue || !currentValue) return;

    setIsLoading(true);
    try {
      const a = parseFloat(previousValue);
      const b = parseFloat(currentValue);
      let response;

      switch (operation) {
        case "add":
          response = await calculatorApi.add(a, b);
          break;
        case "subtract":
          response = await calculatorApi.subtract(a, b);
          break;
        case "multiply":
          response = await calculatorApi.multiply(a, b);
          break;
        case "divide":
          response = await calculatorApi.divide(a, b);
          break;
        case "power":
          response = await calculatorApi.power(a, b);
          break;
        case "percentage":
          response = await calculatorApi.percentage(a, b);
          break;
        case "root":
          response = await calculatorApi.root(a, b);
          break;
      }

      if (response) {
        const equation = `${previousValue} ${getOperationSymbol(operation)} ${currentValue} = ${response.result}`;
        setLastEquation(equation);
        setDisplay(response.result.toString());
        setCurrentValue(response.result.toString());
        // Add to history
        addToHistory(operation, { a, b }, response.result);
        // Reset state for next calculation but preserve operation
        setPreviousValue("");
        setWaitingForNewValue(true);
        setJustCalculated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
    } finally {
      setIsLoading(false);
    }
  }, [operation, previousValue, currentValue]);

  const calculateUnary = useCallback(async (op: UnaryOperation, value: number) => {
    setIsLoading(true);
    try {
      let response;

      switch (op) {
        case "inverse":
          response = await calculatorApi.inverse(value);
          break;
        case "negative":
          response = await calculatorApi.negative(value);
          break;
      }

      if (response) {
        const equation = `${getOperationSymbol(op)}(${value}) = ${response.result}`;
        setLastEquation(equation);
        setDisplay(response.result.toString());
        setCurrentValue(response.result.toString());
        // Reset state for next calculation but preserve operation
        setPreviousValue("");
        setWaitingForNewValue(true);
        setJustCalculated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Prevent default behavior for calculator keys
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace', 'Delete'].includes(key)) {
        event.preventDefault();
      }
      
      // Number keys
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      }
      
      // Decimal point
      else if (key === '.' || key === ',') {
        inputDecimal();
      }
      
      // Operations
      else if (key === '+') {
        performOperation('add');
      }
      else if (key === '-') {
        performOperation('subtract');
      }
      else if (key === '*') {
        performOperation('multiply');
      }
      else if (key === '/') {
        performOperation('divide');
      }
      
      // Equals/Enter
      else if (key === '=' || key === 'Enter') {
        calculate();
      }
      
      // Clear
      else if (key === 'Escape') {
        clearAll();
      }
      else if (key === 'Backspace' || key === 'Delete') {
        clearEntry();
      }
      
      // Additional keyboard shortcuts
      else if (key === 'i' || key === 'I') {
        performOperation('inverse');
      }
      else if (key === 'n' || key === 'N') {
        performOperation('negative');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [inputNumber, inputDecimal, performOperation, clearAll, clearEntry]);

  return (
    <div className="calculator-container">
      {showHistory && (
        <div
          className="history-backdrop"
          onClick={() => setShowHistory(false)}
        />
      )}
      <div className="button-calculator">
        <div className="operation-display">
          <div className="operation-text">
            {previousValue && operation && !waitingForNewValue && (
              <span>{previousValue} {getOperationSymbol(operation)} {currentValue || '0'}</span>
            )}
            {previousValue && operation && waitingForNewValue && (
              <span>{previousValue} {getOperationSymbol(operation)}</span>
            )}
            {/* Show complete equation after calculation */}
            {!previousValue && operation && lastEquation && (
              <span>{lastEquation}</span>
            )}
            {!previousValue && !operation && (
              <span>&nbsp;</span>
            )}
          </div>
        </div>
        <div className="calculator-display">
          <div className="display-text" data-length={display.replace(/\D/g, '').length}>{display}</div>
          {error && <div className="error-message">{error}</div>}
          {isLoading && <div className="loading-message">Calculating...</div>}
        </div>

        <div className="calculator-buttons">
          {/* Row 0: Exponentiation operations */}
          <button className="button advanced" onClick={() => performOperation('sqrt')}>√</button>
          <button className="button advanced" onClick={() => performOperation('power')}>x^y</button>
          <button className="button advanced" onClick={() => performOperation('percentage')}>%</button>
          <button className="button advanced" onClick={() => performOperation('root')}>∛</button>
          
          {/* Row 1: Clear and basic operations */}
          <button className="button clear" onClick={clearAll}>C</button>
          <button className="button clear" onClick={clearEntry}>CE</button>
          <button className="button operation" onClick={() => performOperation('inverse')}>1/x</button>
          <button className="button operation" onClick={() => performOperation('negative')}>-/+</button>

          {/* Row 2: Numbers and operations */}
          <button className="button number" onClick={() => inputNumber('7')}>7</button>
          <button className="button number" onClick={() => inputNumber('8')}>8</button>
          <button className="button number" onClick={() => inputNumber('9')}>9</button>
          <button className="button operation" onClick={() => performOperation('divide')}>÷</button>

          {/* Row 3: Numbers and operations */}
          <button className="button number" onClick={() => inputNumber('4')}>4</button>
          <button className="button number" onClick={() => inputNumber('5')}>5</button>
          <button className="button number" onClick={() => inputNumber('6')}>6</button>
          <button className="button operation" onClick={() => performOperation('multiply')}>×</button>

          {/* Row 4: Numbers and operations */}
          <button className="button number" onClick={() => inputNumber('1')}>1</button>
          <button className="button number" onClick={() => inputNumber('2')}>2</button>
          <button className="button number" onClick={() => inputNumber('3')}>3</button>
          <button className="button operation" onClick={() => performOperation('subtract')}>-</button>

          {/* Row 5: Numbers and operations */}
          <button className="button number" onClick={() => inputNumber('0')}>0</button>
          <button className="button decimal" onClick={inputDecimal}>.</button>
          <button className="button equals" onClick={calculate}>=</button>
          <button className="button operation" onClick={() => performOperation('add')}>+</button>
        </div>
      </div>
      
      {/* History toggle button */}
      <button 
        className="history-toggle-btn" 
        onClick={() => setShowHistory(!showHistory)}
        title={showHistory ? "Hide History" : "Show History"}
      >
        {showHistory ? '◀' : '▶'}
      </button>
      
      {/* Collapsible history panel */}
      {showHistory && (
        <div className="history-panel">
          <History history={history} onClearHistory={clearHistory} />
        </div>
      )}
    </div>
  );
};
