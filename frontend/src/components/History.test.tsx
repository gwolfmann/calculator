import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { History } from './History';
import { HistoryItem } from '../types/calculator';

describe('History', () => {
  const mockClearHistory = jest.fn();

  const mockHistory: HistoryItem[] = [
    {
      id: '1',
      operation: 'add',
      inputs: { a: 10, b: 5 },
      result: 15,
      timestamp: new Date('2025-01-01T12:00:00'),
    },
    {
      id: '2',
      operation: 'multiply',
      inputs: { a: 3, b: 4 },
      result: 12,
      timestamp: new Date('2025-01-01T12:01:00'),
    },
    {
      id: '3',
      operation: 'sqrt',
      inputs: { a: 16 },
      result: 4,
      timestamp: new Date('2025-01-01T12:02:00'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('returns null when history is empty', () => {
      render(<History history={[]} onClearHistory={mockClearHistory} />);
      expect(screen.queryByText('Calculation History')).not.toBeInTheDocument();
    });

    it('renders history items when history is not empty', () => {
      render(<History history={mockHistory} onClearHistory={mockClearHistory} />);
      
      expect(screen.getByText('Calculation History')).toBeInTheDocument();
      expect(screen.getByText('Clear History')).toBeInTheDocument();
    });

    it('displays operation names', () => {
      render(<History history={mockHistory} onClearHistory={mockClearHistory} />);
      
      expect(screen.getByText('add')).toBeInTheDocument();
      expect(screen.getByText('multiply')).toBeInTheDocument();
      expect(screen.getByText('sqrt')).toBeInTheDocument();
    });

    it('displays results', () => {
      render(<History history={mockHistory} onClearHistory={mockClearHistory} />);
      
      expect(screen.getByText(/Result: 15/)).toBeInTheDocument();
      expect(screen.getByText(/Result: 12/)).toBeInTheDocument();
      expect(screen.getByText(/Result: 4/)).toBeInTheDocument();
    });
  });

  describe('Clear History', () => {
    it('calls onClearHistory when clear button is clicked', async () => {
      render(<History history={mockHistory} onClearHistory={mockClearHistory} />);
      const user = userEvent.setup();

      await user.click(screen.getByText('Clear History'));
      expect(mockClearHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unary vs Binary Operations', () => {
    it('displays single input for unary operations', () => {
      const unaryHistory: HistoryItem[] = [
        {
          id: '1',
          operation: 'inverse',
          inputs: { a: 2 },
          result: 0.5,
          timestamp: new Date(),
        },
      ];

      render(<History history={unaryHistory} onClearHistory={mockClearHistory} />);
      expect(screen.getByText(/a = 2/)).toBeInTheDocument();
    });

    it('displays two inputs for binary operations', () => {
      const binaryHistory: HistoryItem[] = [
        {
          id: '1',
          operation: 'add',
          inputs: { a: 10, b: 5 },
          result: 15,
          timestamp: new Date(),
        },
      ];

      render(<History history={binaryHistory} onClearHistory={mockClearHistory} />);
      expect(screen.getByText(/a = 10, b = 5/)).toBeInTheDocument();
    });
  });
});
