import { formatCurrency, type YearlyProjection } from '../utils/calculations';
import type { InvestmentInputs } from './InputForm';
import styles from './ComparisonTable.module.css';

// Helper function for mortgage payment calculation
function calculateMortgagePayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

interface Props {
  projections: YearlyProjection[];
  inputs: InvestmentInputs;
}

export default function ComparisonTable({ projections, inputs }: Props) {
  if (projections.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Investment Projections</h2>
        <p className={styles.noData}>Enter your parameters above to see projections</p>
      </div>
    );
  }

  // Show every year for first 10 years, then every 5 years
  const displayYears = projections.filter((_, index) => {
    const year = index + 1;
    return year <= 10 || year % 5 === 0;
  });

  const finalYear = projections[projections.length - 1];
  const stockAdvantage = finalYear.stockNetWorth - finalYear.propertyNetWorth;

  return (
    <div className={styles.container}>
      <h2>Investment Projections Comparison</h2>
      
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>Final Net Worth Comparison (Year {finalYear.year})</h3>
          <div className={styles.summaryValues}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Rent + Stocks:</span>
              <span className={`${styles.value} ${styles.stock}`}>
                {formatCurrency(finalYear.stockNetWorth)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Own House:</span>
              <span className={`${styles.value} ${styles.property}`}>
                {formatCurrency(finalYear.propertyNetWorth)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Difference:</span>
              <span className={`${styles.value} ${stockAdvantage >= 0 ? styles.positive : styles.negative}`}>
                {stockAdvantage >= 0 ? '+' : ''}{formatCurrency(stockAdvantage)}
                {stockAdvantage >= 0 ? ' (Rent+Stocks ahead)' : ' (Own House ahead)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          {displayYears.map((projection, index) => {
            const yearIndex = projections.findIndex(p => p.year === projection.year);
            const prevProjection = yearIndex > 0 ? projections[yearIndex - 1] : null;
            const prevStockValue = prevProjection ? prevProjection.stockValue : inputs.initialNetWorth;
            
            // Calculate step-by-step values
            const annualRent = inputs.weeklyRent * 52;
            const netInvestment = inputs.yearlyInvestment - annualRent;
            const stockGrowth = prevStockValue * (inputs.stockAnnualReturn / 100);
            
            const loanAmount = inputs.houseCost - inputs.initialNetWorth;
            const monthlyMortgage = loanAmount > 0 ? calculateMortgagePayment(loanAmount, inputs.mortgageRate, 30) : 0;
            const annualMortgage = monthlyMortgage * 12;
            const extraPayment = Math.max(0, inputs.yearlyInvestment - annualMortgage - inputs.ownersCorp);
            
            return (
              <div key={projection.year} className={styles.yearSection}>
                <div className={styles.yearHeader}>
                  <h3>Year {projection.year}</h3>
                  <div className={styles.finalValues}>
                    <span className={styles.stockFinal}>
                      Rent + Stocks: {formatCurrency(projection.stockNetWorth)}
                    </span>
                    <span className={styles.propertyFinal}>
                      Own House: {formatCurrency(projection.propertyNetWorth)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.calculationGrid}>
                  <div className={styles.stockCalculation}>
                    <h4>📊 Rent + Stocks Calculation</h4>
                    <div className={styles.calcSteps}>
                      <div className={styles.calcStep}>
                        <span className={styles.label}>Previous portfolio value:</span>
                        <span className={styles.value}>{formatCurrency(prevStockValue)}</span>
                      </div>
                      <div className={styles.calcStep}>
                        <span className={styles.label}>+ Investment available:</span>
                        <span className={styles.value}>{formatCurrency(netInvestment)}</span>
                        <span className={styles.detail}>
                          ({formatCurrency(inputs.yearlyInvestment)} budget - {formatCurrency(annualRent)} rent)
                        </span>
                      </div>
                      <div className={styles.calcStep}>
                        <span className={styles.label}>+ Portfolio growth:</span>
                        <span className={styles.value}>{formatCurrency(stockGrowth)}</span>
                        <span className={styles.detail}>
                          ({formatCurrency(prevStockValue)} × {inputs.stockAnnualReturn}%)
                        </span>
                      </div>
                      <div className={`${styles.calcStep} ${styles.total}`}>
                        <span className={styles.label}>= Total portfolio:</span>
                        <span className={styles.value}>{formatCurrency(projection.stockValue)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.propertyCalculation}>
                    <h4>🏠 Own House Calculation</h4>
                    <div className={styles.calcSteps}>
                      <div className={styles.calcStep}>
                        <span className={styles.label}>House value:</span>
                        <span className={styles.value}>{formatCurrency(projection.propertyValue)}</span>
                        <span className={styles.detail}>
                          ({formatCurrency(inputs.houseCost)} growing at {inputs.houseGrowthRate}%/year)
                        </span>
                      </div>
                      <div className={styles.calcStep}>
                        <span className={styles.label}>- Mortgage remaining:</span>
                        <span className={styles.value}>-{formatCurrency(projection.mortgageBalance)}</span>
                      </div>
                      <div className={`${styles.calcStep} ${styles.total}`}>
                        <span className={styles.label}>= Net equity:</span>
                        <span className={styles.value}>{formatCurrency(projection.propertyNetWorth)}</span>
                      </div>
                      <div className={styles.yearlyPayments}>
                        <div className={styles.paymentDetail}>
                          <span>Mortgage repayments (mandatory): {formatCurrency(annualMortgage)}/year</span>
                        </div>
                        <div className={styles.paymentDetail}>
                          <span>Mortgage repayments (offset account): {formatCurrency(extraPayment)}/year</span>
                        </div>
                        <div className={styles.paymentDetail}>
                          <span>Owners costs: {formatCurrency(inputs.ownersCorp)}/year</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.footnotes}>
        <h4>Important Notes:</h4>
        <ul>
          <li>Stock returns include dividends and capital growth, simplified for comparison</li>
          <li>House value growth rate is user-adjustable based on your market expectations</li>
          <li>Calculations assume 30-year mortgage term with accelerated payoff from offset account</li>
          <li>All values are in today's dollars (no inflation adjustment)</li>
          <li>Results are estimates only and should not be considered financial advice</li>
        </ul>
      </div>
    </div>
  );
}
