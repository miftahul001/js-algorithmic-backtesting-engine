# JS Algorithmic Backtesting Engine

A lightweight, browser-based, event-driven backtesting engine designed for **rapid strategy prototyping and validation** in cryptocurrency trading. Write your strategy in JavaScript — the engine handles simulation, fee calculation, slippage, and charting.

This project focuses on **realistic simulation**, **clear visualization**, and **developer flexibility** — allowing you to test trading logic without complex setup.

🔗 Live Demo: (https://miftahul001.github.io/js-algorithmic-backtesting-engine/)
📖 Documentation: (https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/DOCUMENTATION.md)


[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://miftahul001.github.io/js-algorithmic-backtesting-engine/)
[![Documentation](https://img.shields.io/badge/Docs-DOCUMENTATION.md-green)](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/DOCUMENTATION.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

![Preview](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/preview.png?raw=true)

---

## 🎯 Why This Project

Most backtesting tools today are:

* Heavy (Python-based, environment setup required)
* Not interactive
* Difficult to customize quickly

This engine is built to solve that:

* ⚡ Run directly in the browser (no installation)
* 🧠 Focus on logic & simulation, not setup
* 📊 Immediate visual feedback using charts
* 🔧 Fully customizable with plain JavaScript

---

## 🚀 Key Features

* **Event-Driven Simulation**
  Strategy runs candle-by-candle, mimicking real market flow

* **Fee & Slippage Modeling**
  Realistic execution with configurable trading cost

* **TP / SL Automation**
  Positions are managed automatically by the engine

* **Custom Indicator System**
  Build any indicator (MA, ATR, Zigzag, etc.) directly in JavaScript

* **Interactive Charting (ECharts)**
  Candlestick + overlay indicators (line, scatter, markPoint, etc.)

* **In-Browser Strategy Editor**
  Write and test strategies instantly (CodeMirror powered)

* **Sandboxed Execution**
  Strategy runs safely inside an iframe

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
Uses native ECharts configuration → flexible & powerful.

---

## 🧠 Architecture Overview

The system is structured into:

* **Data Layer** → OHLCV loader (local JSON)
* **Strategy Layer** → user-defined logic (`onInit`, `onTick`)
* **Execution Layer** → order simulation (fee, slippage, TP/SL)
* **Portfolio Layer** → balance, equity, PnL tracking
* **Visualization Layer** → ECharts rendering


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

## ⚠️ Limitations

* Candle-based simulation (no tick-level precision)
* Orders are executed immediately (no latency model yet)
* Single-strategy execution (no parallel testing)

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

## 💡 About the Author

Built by a **JavaScript developer focused on algorithmic systems and simulation logic**.

This project is part of a broader exploration in:

* trading system design
* probabilistic modeling
* AI-assisted decision systems

---

## 🤝 Open for Work

I am available for:

* JavaScript development (Frontend / Logic)
* Data visualization & dashboard (ECharts)
* Trading tools & backtesting systems

📩 Contact: [miftahulmunir001@gmail.com](mailto:miftahulmunir001@gmail.com)
🔗 LinkedIn: https://www.linkedin.com/in/miftahul-munir-1530888b/

---

## 📄 License

MIT
