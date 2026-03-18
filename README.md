# JS Algorithmic Backtesting Engine

A high-fidelity, modular backtesting framework built with **Node.js** for simulating and validating cryptocurrency trading strategies. This engine is designed for quantitative researchers and developers who require granular control over historical data simulation and technical indicator logic.

## 🚀 Key Features

* **Multi-Timeframe Support:** Optimized handling of D1, H1, and M30 data structures for precise strategy evaluation.
* **Event-Driven Logic:** Built to mimic real-world market execution with minimal latency in simulation.
* **Custom Indicator Suite:** Native implementation of complex indicators including **ATR**, **Zigzag**, and custom trend-following algorithms without relying on heavy external libraries.
* **Local Data Feed:** Efficient JSON-based data management to bypass API rate limits during intensive backtesting sessions.
* **Binance Integration:** Includes a specialized utility script to fetch and synchronize historical kline (candlestick) data directly from the Binance API to local storage.

## 📊 Data Architecture

The engine utilizes a structured local filesystem to manage historical kline data, ensuring fast I/O operations and easy scalability:

```text
|- Data/
|   |-- D1/    # Daily klines (~1000 klines per file)
|   |   |--- 2023-01-01-to-2025-xx-xx.json
|   |   |--- 2025-xx-xx-to-2026-xx-xx.json (current)
|   |-- H1/    # Hourly klines
|   |   |--- 2025-01-01-to-2025-02-xx.json
|   |   |--- 2025-02-xx-to-2025-03-xx.json
|   |-- M30/   # 30-minute klines
|   |   |--- 2025-01-01-to-2025-xx-xx.json
|   |   |--- 2025-xx-xx-to-2025-xx-xx.json
```

## 🛠️ Technology Stack

* **Runtime:** Node.js (ES6+ JavaScript)
* **Data Format:** JSON (Serialized Kline/Candlestick Data)
* **Visualization (Optional):** Integrated with ECharts.js for performance dashboards
* **APIs:** Binance API for data acquisition

## 📥 Getting Started

### 1. Prerequisites
* Node.js installed on your local machine.
* Standard API access (Binance) if fetching new historical data.

### 2. Data Acquisition
This repository includes a script to download historical data directly to your local `/Data` directory. This ensures the backtesting engine has a consistent data feed without constant network dependency.

```bash
# Example command to fetch data 
node scripts/fetch-binance-data.js --symbol BTCUSDT --interval H1
```

### 3. Running a Backtest
Load your strategy and point the engine to the desired JSON data file:

```javascript
const engine = new BacktestingEngine('./Data/H1/2025-01-01-to-2025-02-xx.json');
engine.run(myCustomStrategy);
```

## 🧠 Technical Vision 

This project also serves as a foundational step for broader explorations into **Cognitive AI Architectures**. The ultimate goal is to evolve this backtesting engine into a robust training environment where AI agents can interact, learn, and develop autonomous decision-making capabilities based on strict epistemological guardrails.