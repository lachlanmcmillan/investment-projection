import type { InvestmentInputs } from '../components/InputForm';

export interface YearlyProjection {
  year: number;
  
  // Stock investment path (renting)
  stockValue: number;
  stockCumulativeInvestment: number;
  rentPaid: number;
  stockNetWorth: number; // stocks - rent paid
  
  // Property purchase path
  propertyValue: number;
  mortgageBalance: number;
  propertyNetWorth: number; // property value - mortgage balance
  propertyEquity: number;
  totalInterestPaid: number;
  ownersCostsPaid: number;
  
  // For comparison
  stockTotalCost: number; // rent + opportunity cost
  propertyTotalCost: number; // interest + owners costs + opportunity cost
}

// Calculate monthly mortgage payment
function calculateMortgagePayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// Calculate when mortgage will be paid off with extra payments
function calculatePayoffTime(principal: number, annualRate: number, monthlyPayment: number, extraAnnualPayment: number): number {
  if (extraAnnualPayment <= 0) return 30; // Standard 30 year term
  
  const monthlyRate = annualRate / 100 / 12;
  const totalMonthlyPayment = monthlyPayment + (extraAnnualPayment / 12);
  
  if (monthlyRate === 0) return principal / (totalMonthlyPayment * 12);
  
  // Use formula for amortization with extra payments
  const months = -Math.log(1 - (principal * monthlyRate) / totalMonthlyPayment) / Math.log(1 + monthlyRate);
  return Math.max(0.1, months / 12);
}

// Calculate remaining mortgage balance at a given time
function calculateMortgageBalance(principal: number, annualRate: number, monthlyPayment: number, extraAnnualPayment: number, yearsPaid: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonthlyPayment = monthlyPayment + (extraAnnualPayment / 12);
  const monthsPaid = yearsPaid * 12;
  
  if (monthlyRate === 0) {
    return Math.max(0, principal - (totalMonthlyPayment * monthsPaid));
  }
  
  // Calculate remaining balance with extra payments
  const remainingBalance = principal * Math.pow(1 + monthlyRate, monthsPaid) - 
                          totalMonthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);
  
  return Math.max(0, remainingBalance);
}

// Calculate total interest paid over time
function calculateInterestPaid(principal: number, annualRate: number, monthlyPayment: number, extraAnnualPayment: number, yearsPaid: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonthlyPayment = monthlyPayment + (extraAnnualPayment / 12);
  const monthsPaid = yearsPaid * 12;
  
  let balance = principal;
  let totalInterest = 0;
  
  for (let month = 0; month < monthsPaid && balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(balance, totalMonthlyPayment - interestPayment);
    
    totalInterest += interestPayment;
    balance -= principalPayment;
  }
  
  return totalInterest;
}

export function calculateProjections(inputs: InvestmentInputs): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  
  // Initial setup
  const loanAmount = inputs.houseCost - inputs.initialNetWorth;
  const monthlyMortgage = loanAmount > 0 ? calculateMortgagePayment(loanAmount, inputs.mortgageRate, 30) : 0;
  const annualMortgageCosts = monthlyMortgage * 12 + inputs.ownersCorp;
  const extraAnnualPayment = Math.max(0, inputs.yearlyInvestment - annualMortgageCosts);
  
  // Calculate when mortgage will be paid off
  const payoffTime = loanAmount > 0 ? calculatePayoffTime(loanAmount, inputs.mortgageRate, monthlyMortgage, extraAnnualPayment) : 0;
  const maxYears = Math.max(5, Math.ceil(payoffTime) + 2); // Show a bit beyond payoff
  
  // Annual rent cost
  const annualRent = inputs.weeklyRent * 52;
  
  // Track cumulative values
  let stockValue = inputs.initialNetWorth; // Start with same initial amount
  let cumulativeRent = 0;
  let cumulativeOwnersCosts = 0;
  let propertyValue = inputs.houseCost;
  
  for (let year = 1; year <= maxYears; year++) {
    // Stock path calculations (renting)
    const rentThisYear = annualRent;
    cumulativeRent += rentThisYear;
    
    // Calculate stock investment: yearly investment minus rent
    const netStockInvestment = inputs.yearlyInvestment - rentThisYear;
    stockValue = stockValue * (1 + inputs.stockAnnualReturn / 100) + netStockInvestment;
    
    // Property path calculations
    const mortgageBalance = calculateMortgageBalance(loanAmount, inputs.mortgageRate, monthlyMortgage, extraAnnualPayment, year);
    const interestPaid = calculateInterestPaid(loanAmount, inputs.mortgageRate, monthlyMortgage, extraAnnualPayment, year);
    cumulativeOwnersCosts += inputs.ownersCorp;
    
    // Use user-specified property growth rate
    propertyValue = inputs.houseCost * Math.pow(1 + inputs.houseGrowthRate / 100, year);
    
    const stockNetWorth = stockValue;
    const propertyNetWorth = propertyValue - mortgageBalance;
    const propertyEquity = propertyValue - mortgageBalance;
    
    // Calculate total costs for comparison
    const stockTotalCost = cumulativeRent + (inputs.initialNetWorth * inputs.stockAnnualReturn / 100 * year); // Opportunity cost
    const propertyTotalCost = interestPaid + cumulativeOwnersCosts;
    
    projections.push({
      year,
      stockValue,
      stockCumulativeInvestment: inputs.initialNetWorth + (netStockInvestment * year),
      rentPaid: cumulativeRent,
      stockNetWorth,
      
      propertyValue,
      mortgageBalance,
      propertyNetWorth,
      propertyEquity,
      totalInterestPaid: interestPaid,
      ownersCostsPaid: cumulativeOwnersCosts,
      
      stockTotalCost,
      propertyTotalCost
    });
    
    // Stop calculating after mortgage is paid off
    if (mortgageBalance <= 0 && year > payoffTime) break;
  }
  
  return projections;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(rate: number): string {
  return `${rate.toFixed(2)}%`;
}