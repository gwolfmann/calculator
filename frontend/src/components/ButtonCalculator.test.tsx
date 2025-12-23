import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonCalculator } from './ButtonCalculator';

// Mock the calculatorApi
jest.mock('../services/calculatorApi', () => ({
  calculatorApi: {
    add: jest.fn().mockResolvedValue({ result: 15 }),
    subtract: jest.fn().mockResolvedValue({ result: 5 }),
    multiply: jest.fn().mockResolvedValue({ result: 50 }),
    divide: jest.fn().mockResolvedValue({ result: 2 }),
    power: jest.fn().mockResolvedValue({ result: 8 }),
    percentage: jest.fn().mockResolvedValue({ result: 10 }),
    sqrt: jest.fn().mockResolvedValue({ result: 4 }),
    root: jest.fn().mockResolvedValue({ result: 3 }),
    inverse: jest.fn().mockResolvedValue({ result: 0.5 }),
    negative: jest.fn().mockResolvedValue({ result: -5 }),
  },
}));

// Helper to get display text
const getDisplayText = () => document.querySelector('.display-text')?.textContent;

describe('ButtonCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the calculator with display showing 0', () => {
      render(<ButtonCalculator />);
      expect(getDisplayText()).toBe('0');
    });

    it('renders all number buttons', () => {
      render(<ButtonCalculator />);
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument();
      }
    });

    it('renders operation buttons', () => {
      render(<ButtonCalculator />);
      expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '-' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '÷' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument();
    });

    it('renders clear buttons', () => {
      render(<ButtonCalculator />);
      expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CE' })).toBeInTheDocument();
    });

    it('renders advanced operation buttons', () => {
      render(<ButtonCalculator />);
      expect(screen.getByRole('button', { name: '√' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'x^y' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '%' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '∛' })).toBeInTheDocument();
    });
  });

  describe('Number Input', () => {
    it('displays entered number', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '5' }));
      expect(getDisplayText()).toBe('5');
    });

    it('displays multi-digit number', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '3' }));
      expect(getDisplayText()).toBe('123');
    });

    it('handles decimal input', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '3' }));
      await user.click(screen.getByRole('button', { name: '.' }));
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '4' }));
      expect(getDisplayText()).toBe('3.14');
    });

    it('prevents multiple decimal points', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '3' }));
      await user.click(screen.getByRole('button', { name: '.' }));
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '.' }));
      await user.click(screen.getByRole('button', { name: '4' }));
      expect(getDisplayText()).toBe('3.14');
    });
  });

  describe('Clear Operations', () => {
    it('clears all with C button', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: 'C' }));
      expect(getDisplayText()).toBe('0');
    });

    it('clears entry with CE button', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: 'CE' }));
      expect(getDisplayText()).toBe('0');
    });
  });

  describe('Operation Setup', () => {
    it('sets up addition operation', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '+' }));
      
      // After clicking +, display should still show 10
      expect(getDisplayText()).toBe('10');
    });

    it('allows entering second operand', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '+' }));
      await user.click(screen.getByRole('button', { name: '5' }));
      
      // After entering second operand, display should show 5
      expect(getDisplayText()).toBe('5');
    });
  });

  describe('History Toggle', () => {
    it('toggles history panel visibility', async () => {
      render(<ButtonCalculator />);
      const user = userEvent.setup();

      // History should be hidden initially
      const toggleButton = screen.getByTitle('Show History');
      expect(toggleButton).toBeInTheDocument();

      // Click to show history
      await user.click(toggleButton);
      expect(screen.getByTitle('Hide History')).toBeInTheDocument();
    });
  });
});
