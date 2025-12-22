import './History.css';
import React from 'react';
import { HistoryItem } from '../types/calculator';
import { formatNumber } from '../utils/validation';

interface HistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClearHistory }) => {
  if (history.length === 0) return null;

  return (
    <div className="history">
      <div className="history-header">
        <h3>Calculation History</h3>
        <button onClick={onClearHistory} className="clear-history-btn">
          Clear History
        </button>
      </div>
      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-operation">
              <strong>{item.operation}</strong>
              <span style={{ marginLeft: '8px' }}>
                {item.operation === 'inverse' || item.operation === 'negative' ? (
                  <span>a = {formatNumber((item.inputs as any).a)}</span>
                ) : (
                  <span>a = {formatNumber((item.inputs as any).a)}, b = {formatNumber((item.inputs as any).b)}</span>
                )}
              </span>
            </div>
            <div className="history-result">
              Result: {formatNumber(item.result)}
            </div>
            <div className="history-time">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            {item.error && (
              <div className="history-error">
                Error: {item.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};