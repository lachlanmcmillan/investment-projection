import { useState, useMemo } from 'react';
import InputForm, { type InvestmentInputs } from './components/InputForm';
import ComparisonTable from './components/ComparisonTable';
import NetWorthChart from './components/NetWorthChart';
import { calculateProjections } from './utils/calculations';
import './App.css';

// Default values for the comparison
const defaultInputs: InvestmentInputs = {
  // General parameters
  initialNetWorth: 100000, // Available savings for deposit or investment
  yearlyInvestment: 25000, // Annual amount available for investment/extra payments
  
  // Stock investment path (renting)
  weeklyRent: 500, // Weekly rental cost
  stockAnnualReturn: 9.8, // Expected stock market return including dividends
  
  // Property purchase path (residence)
  houseCost: 1000000, // Purchase price
  mortgageRate: 5.5, // Mortgage interest rate
  houseGrowthRate: 3.5, // Conservative property growth rate
  ownersCorp: 5000, // Annual costs (strata, repairs, rates, insurance)
};

function App() {
  const [inputs, setInputs] = useState<InvestmentInputs>(defaultInputs);

  const projections = useMemo(() => {
    return calculateProjections(inputs);
  }, [inputs]);

  return (
    <div className="app">
      <header className="header">
        <h1>🏠 📈 Rent + Stocks vs Buy House Calculator</h1>
        <p className="subtitle">
          Compare renting and investing in stocks vs purchasing a house as your primary residence. 
          See which path builds more wealth over time in the Australian market.
        </p>
      </header>

      <main className="main">
        <InputForm inputs={inputs} onInputChange={setInputs} />
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
