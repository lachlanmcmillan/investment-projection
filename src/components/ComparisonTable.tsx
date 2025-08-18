import { formatCurrency, type YearlyProjection } from "../utils/calculations";
import type { InvestmentInputs } from "./InputForm";
import styles from "./ComparisonTable.module.css";

// Helper function for mortgage payment calculation
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

// Helper function for mortgage balance calculation
function calculateMortgageBalance(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  extraAnnualPayment: number,
  yearsPaid: number
): number {
  if (yearsPaid >= 30) return 0;

  const monthlyRate = annualRate / 100 / 12;
  const totalMonthlyPayment = monthlyPayment + extraAnnualPayment / 12;
  const monthsPaid = yearsPaid * 12;

  if (monthlyRate === 0) {
    return Math.max(0, principal - totalMonthlyPayment * monthsPaid);
  }

  // Calculate remaining balance with extra payments
  const remainingBalance =
    principal * Math.pow(1 + monthlyRate, monthsPaid) -
    totalMonthlyPayment *
      ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);

  return Math.max(0, remainingBalance);
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
        <p className={styles.noData}>
          Enter your parameters above to see projections
        </p>
      </div>
    );
  }

  // Show all years until mortgage is paid off
  const displayYears = projections;

  const finalYear = projections[projections.length - 1];
  const stockAdvantage = finalYear.stockNetWorth - finalYear.propertyNetWorth;
  const stockWins = stockAdvantage >= 0;
  const finalProjection = finalYear;

  return (
    <div className={styles.container}>
      <h2>Investment Projections Comparison</h2>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Year</th>
              <th>Portfolio</th>
              <th>Growth</th>
              <th>Investment</th>
              <th>Rent Paid</th>
              <th>Net Stocks</th>
              <th>House Value</th>
              <th>Growth</th>
              <th>Mortgage</th>
              <th>Investment</th>
              <th>Fees</th>
              <th>Interest</th>
              <th>Net Property</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {displayYears.map((projection) => {
              const yearIndex = projections.findIndex(
                (p) => p.year === projection.year
              );
              const prevProjection =
                yearIndex > 0 ? projections[yearIndex - 1] : null;
              const prevStockValue = prevProjection
                ? prevProjection.stockValue
                : inputs.initialNetWorth;

              const annualRent = inputs.weeklyRent * 52;
              const stockGrowth =
                prevStockValue * (inputs.stockAnnualReturn / 100);

              const loanAmount = inputs.houseCost - inputs.initialNetWorth;
              const monthlyMortgage =
                loanAmount > 0
                  ? calculateMortgagePayment(
                      loanAmount,
                      inputs.mortgageRate,
                      30
                    )
                  : 0;
              const annualMortgage = monthlyMortgage * 12;
              const extraPayment = Math.max(
                0,
                inputs.yearlyInvestment - annualMortgage - inputs.ownersCorp
              );

              // Calculate beginning of year house value
              const beginningHouseValue =
                yearIndex > 0
                  ? inputs.houseCost *
                    Math.pow(
                      1 + inputs.houseGrowthRate / 100,
                      projection.year - 1
                    )
                  : inputs.houseCost;

              // Calculate house growth for this year
              const houseGrowth =
                beginningHouseValue * (inputs.houseGrowthRate / 100);

              // Calculate beginning of year mortgage balance
              const beginningMortgageBalance =
                yearIndex > 0
                  ? calculateMortgageBalance(
                      loanAmount,
                      inputs.mortgageRate,
                      monthlyMortgage,
                      extraPayment,
                      projection.year - 1
                    )
                  : loanAmount;

              // Calculate annual interest payment for this year
              const annualInterestPayment =
                beginningMortgageBalance * (inputs.mortgageRate / 100);

              const difference =
                projection.stockNetWorth - projection.propertyNetWorth;
              const leader = difference >= 0 ? "S" : "P";

              return (
                <tr key={projection.year} className={styles.tableRow}>
                  <td className={styles.yearCell}>{projection.year}</td>

                  {/* Stock columns */}
                  <td>{formatCurrency(prevStockValue)}</td>
                  <td className={styles.positive}>
                    +{formatCurrency(stockGrowth)}
                  </td>
                  <td className={styles.positive}>
                    +{formatCurrency(inputs.yearlyInvestment)}
                  </td>
                  <td className={styles.negative}>
                    -{formatCurrency(annualRent)}
                  </td>
                  <td className={styles.totalStock}>
                    {formatCurrency(projection.stockNetWorth)}
                  </td>

                  {/* Property columns */}
                  <td>{formatCurrency(beginningHouseValue)}</td>
                  <td className={styles.positive}>
                    +{formatCurrency(houseGrowth)}
                  </td>
                  <td className={styles.negative}>
                    -{formatCurrency(beginningMortgageBalance)}
                  </td>
                  <td className={styles.positive}>
                    +{formatCurrency(inputs.yearlyInvestment)}
                  </td>
                  <td className={styles.negative}>
                    -{formatCurrency(inputs.ownersCorp)}
                  </td>
                  <td className={styles.negative}>
                    -{formatCurrency(annualInterestPayment)}
                  </td>
                  <td className={styles.totalProperty}>
                    {formatCurrency(projection.propertyNetWorth)}
                  </td>

                  {/* Winner */}
                  <td
                    className={`${styles.winner} ${
                      difference >= 0 ? styles.stockWins : styles.propertyWins
                    }`}
                  >
                    {leader} {formatCurrency(Math.abs(difference))}
                  </td>
                </tr>
              );
            })}

            {/* Totals Row */}
            <tr className={styles.totalsRow}>
              <td className={styles.totalsLabel}>TOTALS</td>
              {/* Stock totals */}
              <td>-</td> {/* Portfolio (not applicable) */}
              <td className={styles.positive}>
                +
                {formatCurrency(
                  displayYears.reduce((sum, projection) => {
                    const yearIndex = projections.findIndex(
                      (p) => p.year === projection.year
                    );
                    const prevProjection =
                      yearIndex > 0 ? projections[yearIndex - 1] : null;
                    const prevStockValue = prevProjection
                      ? prevProjection.stockValue
                      : inputs.initialNetWorth;
                    const stockGrowth =
                      prevStockValue * (inputs.stockAnnualReturn / 100);
                    return sum + stockGrowth;
                  }, 0)
                )}
              </td>{" "}
              {/* Total Stock Growth */}
              <td className={styles.positive}>
                +{formatCurrency(inputs.yearlyInvestment * displayYears.length)}
              </td>{" "}
              {/* Total Investment */}
              <td className={styles.negative}>
                -{formatCurrency(inputs.weeklyRent * 52 * displayYears.length)}
              </td>{" "}
              {/* Total Rent */}
              <td>-</td> {/* Net Stocks (not applicable) */}
              {/* Property totals */}
              <td>-</td> {/* House Value (not applicable) */}
              <td className={styles.positive}>
                +
                {formatCurrency(
                  displayYears.reduce((sum, projection) => {
                    const yearIndex = projections.findIndex(
                      (p) => p.year === projection.year
                    );
                    const beginningHouseValue =
                      yearIndex > 0
                        ? inputs.houseCost *
                          Math.pow(
                            1 + inputs.houseGrowthRate / 100,
                            projection.year - 1
                          )
                        : inputs.houseCost;
                    const houseGrowth =
                      beginningHouseValue * (inputs.houseGrowthRate / 100);
                    return sum + houseGrowth;
                  }, 0)
                )}
              </td>{" "}
              {/* Total House Growth */}
              <td>-</td> {/* Mortgage (not applicable) */}
              <td className={styles.positive}>
                +{formatCurrency(inputs.yearlyInvestment * displayYears.length)}
              </td>{" "}
              {/* Total Investment */}
              <td className={styles.negative}>
                -{formatCurrency(inputs.ownersCorp * displayYears.length)}
              </td>{" "}
              {/* Total Fees */}
              <td className={styles.negative}>
                -
                {formatCurrency(
                  displayYears.reduce((sum, projection) => {
                    const yearIndex = projections.findIndex(
                      (p) => p.year === projection.year
                    );
                    const loanAmount =
                      inputs.houseCost - inputs.initialNetWorth;
                    const monthlyMortgage =
                      loanAmount > 0
                        ? calculateMortgagePayment(
                            loanAmount,
                            inputs.mortgageRate,
                            30
                          )
                        : 0;
                    const extraPayment = Math.max(
                      0,
                      inputs.yearlyInvestment -
                        monthlyMortgage * 12 -
                        inputs.ownersCorp
                    );
                    const beginningMortgageBalance =
                      yearIndex > 0
                        ? calculateMortgageBalance(
                            loanAmount,
                            inputs.mortgageRate,
                            monthlyMortgage,
                            extraPayment,
                            projection.year - 1
                          )
                        : loanAmount;
                    const annualInterestPayment =
                      beginningMortgageBalance * (inputs.mortgageRate / 100);
                    return sum + annualInterestPayment;
                  }, 0)
                )}
              </td>{" "}
              {/* Total Interest */}
              <td>-</td> {/* Net Interest (same as last year's cumulative) */}
              <td>-</td> {/* Net Property (not applicable) */}
              <td>-</td> {/* Winner (not applicable) */}
            </tr>
          </tbody>
        </table>
      </div>



      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>Key Insights</h3>
          <div className={styles.insights}>
            <div className={styles.insight}>
              <span className={styles.icon}>🏆</span>
              <div>
                <strong>{stockWins ? 'Rent + Stocks' : 'Own House'}</strong> comes out ahead
                <br />
                <span className={styles.amount}>
                  by {formatCurrency(Math.abs(stockAdvantage))} after {finalProjection.year} years
                </span>
              </div>
            </div>
            
            <div className={styles.insight}>
              <span className={styles.icon}>📈</span>
              <div>
                <strong>Rent + Stocks</strong> net worth
                <br />
                <span className={styles.amount}>
                  {formatCurrency(finalProjection.stockNetWorth)}
                </span>
              </div>
            </div>
            
            <div className={styles.insight}>
              <span className={styles.icon}>🏠</span>
              <div>
                <strong>Own House</strong> net worth
                <br />
                <span className={styles.amount}>
                  {formatCurrency(finalProjection.propertyNetWorth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footnotes}>
        <h4>Important Notes:</h4>
        <ul>
          <li>
            Stock returns include dividends and capital growth, simplified for
            comparison, dividends may incur taxes
          </li>
          <li>
            House value growth rate is user-adjustable based on your market
            expectations
          </li>
          <li>
            Calculations assume 30-year mortgage term with accelerated payoff
            from offset account
          </li>
          <li>All values are in today's dollars (no inflation adjustment)</li>
          <li>
            Results are estimates only and should not be considered financial
            advice
          </li>
        </ul>
      </div>

      <div className={styles.disclaimer}>
        <p>
          <strong>Disclaimer:</strong> This tool is for illustrative purposes only and does not constitute financial advice. 
          Past performance is not indicative of future results. Consider consulting with a qualified financial advisor 
          before making investment decisions.
        </p>
      </div>
    </div>
  );
}
