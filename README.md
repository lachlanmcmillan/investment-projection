# 🏠 📈 Investment Projection Calculator

(Vibe coded) 

An interactive web application that compares two major financial strategies for Australian home buyers: **renting + investing in stocks** vs **purchasing a house as your primary residence**.

## 🎯 What Does This Tool Do?

This calculator helps you make informed decisions about one of life's biggest financial choices by modeling both paths over time:

### Path 1: Rent + Stock Investment
- Use your initial savings to invest in the stock market
- Continue renting while making regular stock investments
- Track how your stock portfolio grows over time

### Path 2: House Purchase
- Use your initial savings as a house deposit
- Take out a mortgage for the remaining amount
- Make regular mortgage payments and track property appreciation

## 📊 Key Features

- **Interactive Parameter Adjustment**: Customize all variables to match your situation
- **Visual Net Worth Comparison**: See both paths plotted on an interactive chart
- **Detailed Year-by-Year Breakdown**: Compare costs, investments, and net worth annually
- **Australian Market Focus**: Formatted for AUD currency and typical Australian scenarios
- **Real-time Calculations**: Results update instantly as you change parameters

## 🔧 Parameters You Can Adjust

### General Parameters
- **Initial Net Worth**: Your available savings for deposit or initial investment
- **Yearly Investment**: Annual amount available for investments/extra mortgage payments

### Stock Investment Path (Renting)
- **Weekly Rent**: Your rental costs per week
- **Stock Annual Return**: Expected stock market return (including dividends)

### Property Purchase Path
- **House Cost**: Total purchase price of the property
- **Mortgage Rate**: Annual interest rate on your home loan
- **House Growth Rate**: Expected annual property appreciation
- **Annual Ownership Costs**: Strata fees, repairs, rates, insurance, etc.

## 🧮 How It Works

The calculator performs sophisticated financial modeling:

1. **Mortgage Calculations**: Computes monthly payments, interest costs, and payoff timelines
2. **Investment Growth**: Models compound growth of stock investments over time
3. **Net Worth Tracking**: Calculates total net worth for both scenarios annually
4. **Cost Comparison**: Factors in opportunity costs, interest payments, and ongoing expenses

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Bun](https://bun.sh/) package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd investment-projection
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS Modules
- **Package Manager**: Bun

## ⚠️ Important Disclaimers

- **Not Financial Advice**: This tool provides estimates and comparisons only
- **Simplified Model**: Real-world scenarios may involve additional factors not captured here
- **Australian Context**: Calculations are optimized for the Australian property and stock markets
- **Conservative Estimates**: Default values aim to be realistic but may not reflect your specific situation

## 🎨 Customization

The application uses default values that represent typical Australian scenarios:
- 9.8% annual stock return (historical ASX performance including dividends)
- 3.5% property growth rate (conservative long-term average)
- Standard 30-year mortgage terms

Adjust these values to match your expectations and local market conditions.

## 🤝 Contributing

This is a personal financial planning tool, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built for Australian home buyers • Simplified comparison tool • Results are estimates only**