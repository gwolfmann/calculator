import React, { useState } from 'react';
import { ButtonCalculator } from './components/ButtonCalculator';
import { History } from './components/History';
import { HistoryItem } from './types/calculator';
import './App.css';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>React Calculator Frontend</h1>
        <p>Connects to Go Calculator API</p>
      </header>
      
      <main className="app-main">
        <div className="calculator-section">
          <h2>Button Calculator</h2>
          <ButtonCalculator />
        </div>
        <History history={history} onClearHistory={handleClearHistory} />
      </main>
      
      <footer className="app-footer">
        <p>Built with React, TypeScript, and Go API</p>
      </footer>
    </div>
  );
};

export default App;