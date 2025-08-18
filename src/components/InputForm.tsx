import { useState } from 'react';
import styles from './InputForm.module.css';

export interface InvestmentInputs {
  // General parameters
  initialNetWorth: number;
  yearlyInvestment: number;

  // Stock investment path (renting)
  weeklyRent: number;
  stockAnnualReturn: number;

  // Property purchase path (residence)
  houseCost: number;
  mortgageRate: number;
  houseGrowthRate: number;
  ownersCorp: number; // Annual costs including repairs, strata, etc.
}

interface Props {
  inputs: InvestmentInputs;
  onInputChange: (field: keyof InvestmentInputs, value: number) => void;
  onInputBlur: () => void;
}

export default function InputForm({
  inputs,
  onInputChange,
  onInputBlur,
}: Props) {
  // Track display values for inputs to handle empty states
  const [displayValues, setDisplayValues] = useState<
    Partial<Record<keyof InvestmentInputs, string>>
  >({});

  const handleInputChange = (field: keyof InvestmentInputs, value: string) => {
    // Update display value immediately
    setDisplayValues((prev) => ({ ...prev, [field]: value }));

    // Convert to number and update actual state
    const numValue = value === '' ? 0 : Number(value);
    if (value === '' || !isNaN(numValue)) {
      onInputChange(field, numValue);
    }
  };

  const handleInputBlur = (field: keyof InvestmentInputs) => {
    // Clear display value on blur so it shows the actual numeric value
    setDisplayValues((prev) => {
      const newDisplayValues = { ...prev };
      delete newDisplayValues[field];
      return newDisplayValues;
    });
    onInputBlur();
  };

  const getDisplayValue = (field: keyof InvestmentInputs): string => {
    return displayValues[field] ?? inputs[field].toString();
  };

  // Calculate derived values for display
  const deposit = inputs.initialNetWorth;
  const loanAmount = inputs.houseCost - deposit;
  const monthlyMortgage =
    loanAmount > 0
      ? calculateMortgagePayment(loanAmount, inputs.mortgageRate, 30)
      : 0;
  const totalMortgagePayments = monthlyMortgage * 12 + inputs.ownersCorp;
  const additionalPayment = Math.max(
    0,
    inputs.yearlyInvestment - totalMortgagePayments
  );
  const payoffTime =
    loanAmount > 0
      ? calculatePayoffTime(
          loanAmount,
          inputs.mortgageRate,
          monthlyMortgage,
          additionalPayment
        )
      : 0;

  // Calculate affordability
  const isUnaffordable = inputs.yearlyInvestment < totalMortgagePayments;
  const minimumYearlyRequired = totalMortgagePayments;

  return (
    <div className={styles.container}>
      <h2>Rent + Stocks vs Buy House Comparison</h2>
      <p className={styles.description}>
        Compare renting and investing in stocks vs purchasing a house as your
        primary residence.
      </p>

      <div className={styles.section}>
        <h3>General Parameters</h3>
        <div className={styles.inputGroup}>
          <label>Initial Net Worth / Deposit ($)</label>
          <input
            type="number"
            value={getDisplayValue('initialNetWorth')}
            onChange={(e) =>
              handleInputChange('initialNetWorth', e.target.value)
            }
            onBlur={() => handleInputBlur('initialNetWorth')}
            step="10000"
          />
          <small>
            Your current savings available for investment or house deposit
          </small>
        </div>
        <div className={styles.inputGroup}>
          <label>Yearly Investment / Extra Payments ($)</label>
          <input
            type="number"
            value={getDisplayValue('yearlyInvestment')}
            onChange={(e) =>
              handleInputChange('yearlyInvestment', e.target.value)
            }
            onBlur={() => handleInputBlur('yearlyInvestment')}
            step="1000"
          />
          <small>Amount you can invest annually (after living expenses)</small>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Stock Investment Path (While Renting)</h3>
        <div className={styles.inputGroup}>
          <label>Weekly Rent ($)</label>
          <input
            type="number"
            value={getDisplayValue('weeklyRent')}
            onChange={(e) => handleInputChange('weeklyRent', e.target.value)}
            onBlur={() => handleInputBlur('weeklyRent')}
            step="25"
          />
          <small>Your rental cost per week</small>
        </div>
        <div className={styles.inputGroup}>
          <label>Stock Annual Return (%)</label>
          <input
            type="number"
            value={getDisplayValue('stockAnnualReturn')}
            onChange={(e) =>
              handleInputChange('stockAnnualReturn', e.target.value)
            }
            onBlur={() => handleInputBlur('stockAnnualReturn')}
            step="0.5"
          />
          <small>
            Expected total return including dividends and capital growth
          </small>
        </div>
      </div>

      <div className={styles.section}>
        <h3>House Purchase Path</h3>
        <div className={styles.inputGroup}>
          <label>House Cost ($)</label>
          <input
            type="number"
            value={getDisplayValue('houseCost')}
            onChange={(e) => handleInputChange('houseCost', e.target.value)}
            onBlur={() => handleInputBlur('houseCost')}
            step="25000"
            className={isUnaffordable ? styles.errorInput : ''}
          />
          <small>Total purchase price of the house</small>
          {isUnaffordable && (
            <div className={styles.errorMessage}>
              ⚠️ This house price requires a minimum of{' '}
              <strong>{formatCurrency(minimumYearlyRequired)}/year</strong> in
              repayments. Increase your yearly investment or choose a cheaper
              house.
            </div>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label>Mortgage Interest Rate (%)</label>
          <input
            type="number"
            value={getDisplayValue('mortgageRate')}
            onChange={(e) => handleInputChange('mortgageRate', e.target.value)}
            onBlur={() => handleInputBlur('mortgageRate')}
            step="0.1"
          />
          <small>Annual interest rate on the mortgage</small>
        </div>
        <div className={styles.inputGroup}>
          <label>House Growth Rate (% p.a.)</label>
          <input
            type="number"
            value={getDisplayValue('houseGrowthRate')}
            onChange={(e) =>
              handleInputChange('houseGrowthRate', e.target.value)
            }
            onBlur={() => handleInputBlur('houseGrowthRate')}
            step="0.1"
          />
          <small>Expected annual property value growth rate</small>
        </div>
        <div className={styles.inputGroup}>
          <label>Owners Corp, Repairs, etc. ($/year)</label>
          <input
            type="number"
            value={getDisplayValue('ownersCorp')}
            onChange={(e) => handleInputChange('ownersCorp', e.target.value)}
            onBlur={() => handleInputBlur('ownersCorp')}
            step="500"
          />
          <small>
            Annual costs for maintenance, strata fees, council rates, insurance
          </small>
        </div>
      </div>

      <div
        className={`${styles.calculations} ${isUnaffordable ? styles.calculationsDisabled : ''}`}
      >
        <h3>Quick Calculations</h3>
        <p className={styles.calcDescription}>
          {isUnaffordable
            ? '⚠️ Fix the affordability issue above to see calculations'
            : 'These calculations show what happens with your inputs. Check the table below for detailed year-by-year breakdowns.'}
        </p>
        {!isUnaffordable && (
          <div className={styles.calcGrid}>
            <div className={styles.calcItem}>
              <span>Loan Amount:</span>
              <span>{formatCurrency(loanAmount)}</span>
            </div>
            <div className={styles.calcItem}>
              <span>Monthly Mortgage:</span>
              <span>{formatCurrency(monthlyMortgage)}</span>
            </div>
            <div className={styles.calcItem}>
              <span>Total Annual Housing Costs:</span>
              <span>{formatCurrency(totalMortgagePayments)}</span>
            </div>
            <div className={styles.calcItem}>
              <span>Extra Payment Capacity:</span>
              <span>{formatCurrency(additionalPayment)}</span>
            </div>
            <div className={styles.calcItem}>
              <span>Estimated Payoff Time:</span>
              <span>{payoffTime.toFixed(1)} years</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for calculations
function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) return principal / numPayments;

  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

function calculatePayoffTime(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  extraAnnualPayment: number
): number {
  if (extraAnnualPayment <= 0) return 30; // Standard 30 year term

  const monthlyRate = annualRate / 100 / 12;
  const totalMonthlyPayment = monthlyPayment + extraAnnualPayment / 12;

  if (monthlyRate === 0) return principal / (totalMonthlyPayment * 12);

  // Use formula for amortization with extra payments
  const months =
    -Math.log(1 - (principal * monthlyRate) / totalMonthlyPayment) /
    Math.log(1 + monthlyRate);
  return Math.max(0.1, months / 12);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
