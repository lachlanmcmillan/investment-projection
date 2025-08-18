import { useMemo } from 'react';
import InputForm from './components/InputForm';
import ComparisonTable from './components/ComparisonTable';
import NetWorthChart from './components/NetWorthChart';
import { calculateProjections } from './utils/calculations';
import { useAppState } from './hooks/useAppState';
import './App.css';

function App() {
  const { inputs, handleInputChange, handleInputBlur } = useAppState();

  const projections = useMemo(() => {
    return calculateProjections(inputs);
  }, [inputs]);

  return (
    <div className="app">
      <header className="header">
        <h1>🏠 📈 Stocks vs Property Calculator</h1>
        <p className="subtitle">
          Compare renting and investing in stocks vs purchasing a house as your primary residence. 
          See which path builds more wealth over time in the Australian market.
        </p>
      </header>

      <main className="main">
        <InputForm inputs={inputs} onInputChange={handleInputChange} onInputBlur={handleInputBlur} />
        <NetWorthChart projections={projections} inputs={inputs} />
        <ComparisonTable projections={projections} inputs={inputs} />
      </main>

      <footer className="footer">
        <p>
          Built for Australian home buyers • Simplified comparison tool • 
          Results are estimates only and not financial advice
        </p>
      </footer>
    </div>
  );
}

export default App
