# Real-Time Stock Market Dashboard (Python & Streamlit)

A real-time stock market tracking and visualization dashboard built with **Python**, **Streamlit**, **Pandas**, **Plotly**, and the **Requests API**.

---

## 🚀 Features

- **Live & Historical Market Data**: Fetches stock prices, OHLC history, and volume via the Requests API.
- **Interactive Multi-Panel Plotly Charts**:
  - Main Candlestick (OHLC) chart with Bollinger Bands & Moving Average overlays.
  - Trading Volume bar chart with bull/bear color coding.
  - RSI (Relative Strength Index) oscillator with overbought (70) and oversold (30) levels.
  - MACD (Moving Average Convergence Divergence) with signal line and histogram.
- **Customizable Technical Indicators**:
  - Bollinger Bands (20, 2 std)
  - Simple Moving Averages (SMA 20, SMA 50)
  - Exponential Moving Averages (EMA 12, EMA 26)
  - RSI (14) & MACD (12, 26, 9)
- **Multi-Stock & Custom Ticker Support**: Preloaded with popular tech & market tickers (AAPL, NVDA, MSFT, GOOGL, AMZN, TSLA, META, SPY, QQQ) plus support for any custom ticker.
- **Auto-Refresh Live Stream**: Simulated real-time tick updates with customizable intervals.
- **Technical Signals Summary**: Automatic calculation of Bullish/Bearish crossover status, RSI momentum, and price vs moving average benchmarks.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **Python 3.10+** | Core programming language |
| **Streamlit** | Interactive web dashboard framework |
| **Pandas & NumPy** | Financial time-series manipulation & indicator formulas |
| **Plotly Graph Objects** | Interactive financial candlestick and oscillator subplots |
| **Requests API** | HTTP client for market data fetching |

---

## 📦 Installation & Setup

1. **Clone or Download the Project**:
   Ensure all files are placed in a project directory:
   ```bash
   cd python_project
   ```

2. **Create a Virtual Environment (Recommended)**:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Streamlit Dashboard**:
   ```bash
   streamlit run app.py
   ```

5. **Open in Your Browser**:
   Streamlit will open the dashboard automatically at `http://localhost:8501`.

---

## 📂 Project Structure

```
python_project/
├── app.py              # Main Streamlit dashboard application
├── indicators.py       # Technical indicator calculation engine (Pandas/NumPy)
├── data_fetcher.py     # Live market data fetcher (Requests API + fallback)
├── requirements.txt    # Python package dependencies
└── README.md           # Documentation and setup instructions
```
