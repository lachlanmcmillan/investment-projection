import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency, type YearlyProjection } from '../utils/calculations';
import type { InvestmentInputs } from './InputForm';
import styles from './NetWorthChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  projections: YearlyProjection[];
  inputs: InvestmentInputs;
}



export default function NetWorthChart({ projections }: Props) {
  if (projections.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Net Worth Growth Over Time</h2>
        <div className={styles.noData}>
          <p>Enter your parameters above to see the growth chart</p>
        </div>
      </div>
    );
  }

  const labels = projections.map(p => `Year ${p.year}`);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Rent + Stocks Net Worth',
        data: projections.map(p => p.stockNetWorth),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: false,
        tension: 0.2,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#2980b9',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Own House Net Worth',
        data: projections.map(p => p.propertyNetWorth),
        borderColor: '#e67e22',
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        fill: false,
        tension: 0.2,
        pointBackgroundColor: '#e67e22',
        pointBorderColor: '#d35400',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Net Worth Comparison Over Time',
        padding: {
          bottom: 30,
        },
        color: '#2c3e50',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(44, 62, 80, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3498db',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 16,
        caretPadding: 10,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          },
          afterBody: function(tooltipItems: any[]) {
            if (tooltipItems.length === 2) {
              const stockValue = tooltipItems[0].parsed.y;
              const propertyValue = tooltipItems[1].parsed.y;
              const difference = stockValue - propertyValue;
              const leader = difference >= 0 ? 'Rent+Stocks' : 'Own House';
              return [
                '',
                `Difference: ${formatCurrency(Math.abs(difference))}`,
                `${leader} is ahead`
              ];
            }
            return [];
          }
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Period',
          color: '#2c3e50',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#5a6c7d',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Net Worth (AUD)',
          color: '#2c3e50',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#5a6c7d',
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };

  const finalProjection = projections[projections.length - 1];
  const stockAdvantage = finalProjection.stockNetWorth - finalProjection.propertyNetWorth;
  const stockWins = stockAdvantage >= 0;

  return (
    <div className={styles.container}>
      <h2>Net Worth Growth Over Time</h2>
      <p className={styles.hoverHint}>
        📊 View the table below for detailed step-by-step calculations
      </p>
      
      <div className={styles.chartContainer}>
        <Line data={data} options={options} />
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

      <div className={styles.disclaimer}>
        <p>
          <strong>Disclaimer:</strong> This chart is for illustrative purposes only and does not constitute financial advice. 
          Past performance is not indicative of future results. Consider consulting with a qualified financial advisor 
          before making investment decisions.
        </p>
      </div>
    </div>
  );
}
