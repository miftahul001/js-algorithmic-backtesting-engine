# JS Algorithmic Backtesting Engine

A browser-based, event-driven backtesting framework for simulating and validating cryptocurrency trading strategies. Write your strategy in JavaScript — the engine handles simulation, fee calculation, slippage, and charting.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://miftahul001.github.io/js-algorithmic-backtesting-engine/)
[![Documentation](https://img.shields.io/badge/Docs-DOCUMENTATION.md-green)](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/DOCUMENTATION.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

![Preview](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/preview.png?raw=true)

---

## 🚀 Key Features

- **Event-Driven Execution** — Strategies run candle-by-candle, mirroring real-world market flow
- **Fee & Slippage Simulation** — Entry and exit fees calculated per-trade; configurable slippage per order
- **TP / SL Auto-Management** — Engine monitors open positions and closes them automatically when Take Profit or Stop Loss is hit
- **Custom Indicator Support** — No external indicator libraries required; build ATR, Zigzag, MA, or any custom logic natively in JavaScript
- **ECharts Visualization** — Results rendered as interactive candlestick charts with overlay indicators (line, scatter, markLine, markPoint)
- **Multi-Timeframe Data** — Local JSON data feed supports D1, H1, M30 structures; no API rate limits during backtesting
- **In-Browser Code Editor** — Powered by CodeMirror with JavaScript syntax highlighting; no build step required
- **Sandboxed Execution** — Strategy code runs inside an `<iframe>`, keeping the main UI safe from runtime errors

---

## 📋 Quick Start

No installation required. This is a fully static browser application.

```bash
git clone https://github.com/miftahul001/js-algorithmic-backtesting-engine.git
cd js-algorithmic-backtesting-engine

# Serve with any static file server
npx serve .
```

Open `http://localhost:3000` in your browser, click **New**, write your strategy, click **Run**.

> ⚠️ Do not open `index.html` directly via `file://` — candle data is loaded via `fetch()` which requires a server.

---

## ✍️ Writing a Strategy

Every strategy implements two functions:

```javascript
function onInit() {
    // Called once before the first candle.
    // Initialize the backtest engine, buffers, and chart series here.
    abe.createBacktestEngine(1000, 0.05, 0.5) // balance, feePercent, slippagePoint
}

function onTick(candle) {
    // Called once per candle: { t, o, h, l, c, v }
    // Place indicator logic and order management here.
}
```

A persistent `userData` object is available for storing state between ticks.

---

## 🔌 Core API

| Method | Description |
|--------|-------------|
| `abe.createBacktestEngine(balance, fee, slippage)` | Initialize the simulation engine |
| `abe.backtestEngine.sendOrder(side, price, time, params)` | Open a BUY or SELL position |
| `abe.backtestEngine.modifyOrder({ id, newTp, newSl })` | Update TP/SL on an open position (trailing stop) |
| `abe.backtestEngine.closeOrder(id, price, time)` | Manually close a position |
| `abe.backtestEngine.getStats()` | Get final balance, win rate, and trade history |
| `abe.addChart(echartsSeriesParams)` | Register a chart series (line, scatter, markLine, markPoint) |
| `abe.showTrade()` | Open a floating trade log panel |

📖 **Full API reference, parameter tables, and examples:** [DOCUMENTATION.md](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/DOCUMENTATION.md)

---

## 📊 Data Architecture

Historical kline data is stored locally as JSON, structured by timeframe:

```
data/
├── D1/
│   └── 2023-01-01.json      # Daily klines
├── H1/
│   └── 2025-01-01.json      # Hourly klines
└── 30m/
    └── 2025-01-01.json      # 30-minute klines (default)
```

Each candle object follows the Binance kline format:

```json
{ "t": 1735689600000, "o": 94821.5, "h": 95100.0, "l": 94600.3, "c": 94980.2, "v": 123.456 }
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Vanilla JavaScript (ES6+), Browser |
| Chart | [ECharts.js](https://echarts.apache.org/) |
| Code Editor | [CodeMirror](https://codemirror.net/) |
| DOM Utility | [m.js](https://github.com/miftahul001/m) — personal helper library |
| Data Format | JSON (Binance kline format) |
| Deployment | GitHub Pages (static, no backend) |

---

## 🧠 Technical Vision

This project serves as the simulation core of a broader algorithmic trading system, which includes:

- A **data pipeline** for fetching and storing historical kline data from Binance
- A **proprietary indicator suite** — non-repainting Zigzag, dynamic ATR anchored to swing events, and multi-tiered support/resistance levels
- A future **AI training environment** where autonomous agents learn decision-making from market structure

---

## 📄 License

MIT
